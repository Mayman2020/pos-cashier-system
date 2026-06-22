package com.poscashier.modules.pos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.modifier.entity.ProductModifier;
import com.poscashier.modules.modifier.repository.ProductModifierRepository;
import com.poscashier.modules.payment.entity.Payment;
import com.poscashier.modules.payment.repository.PaymentRepository;
import com.poscashier.modules.pos.dto.CreateOrderRequest;
import com.poscashier.modules.pos.dto.OrderItemRequest;
import com.poscashier.modules.pos.dto.OrderResponse;
import com.poscashier.modules.pos.dto.PayOrderRequest;
import com.poscashier.modules.pos.dto.UpdateOrderRequest;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.entity.PosOrderItem;
import com.poscashier.modules.pos.repository.PosOrderItemRepository;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.modules.product.entity.Product;
import com.poscashier.modules.product.service.ProductService;
import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.modules.shift.service.ShiftService;
import com.poscashier.modules.table.service.TableService;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.OrderStatus;
import com.poscashier.shared.enums.OrderType;
import com.poscashier.shared.enums.PaymentMethod;
import com.poscashier.shared.enums.TableStatus;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class PosOrderService {

    private static final Set<OrderStatus> EDITABLE = EnumSet.of(
            OrderStatus.DRAFT, OrderStatus.HELD, OrderStatus.PENDING);
    private static final AtomicLong ORDER_SEQ = new AtomicLong(System.currentTimeMillis() % 100000);

    private final PosOrderRepository orderRepository;
    private final PosOrderItemRepository itemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductService productService;
    private final ProductModifierRepository modifierRepository;
    private final ShiftService shiftService;
    private final InventoryService inventoryService;
    private final TableService tableService;
    private final MessageSource messageSource;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<OrderResponse> list(Long branchId, OrderStatus status, String q, Pageable pageable) {
        return orderRepository.search(branchId, status, q, pageable)
                .map(o -> OrderResponse.from(o, itemRepository.findByOrderId(o.getId())));
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        PosOrder order = findEntity(id);
        return OrderResponse.from(order, itemRepository.findByOrderId(order.getId()));
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Shift shift = shiftService.getOpenShiftForCashier(user.getId());

        PosOrder order = PosOrder.builder()
                .orderNumber(generateOrderNumber())
                .branchId(request.getBranchId())
                .shiftId(shift.getId())
                .cashierId(user.getId())
                .customerId(request.getCustomerId())
                .tableId(request.getTableId())
                .orderType(request.getOrderType() != null ? request.getOrderType() : OrderType.RETAIL)
                .status(OrderStatus.PENDING)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);
        List<PosOrderItem> items = buildItems(order.getId(), request.getItems());
        applyKitchenStatus(order, items);
        itemRepository.saveAll(items);
        recalculateTotals(order, items);
        order = orderRepository.save(order);
        occupyTable(order.getTableId());
        return OrderResponse.from(order, items);
    }

    @Transactional
    public OrderResponse update(Long id, UpdateOrderRequest request) {
        PosOrder order = findEntity(id);
        ensureEditable(order);

        Long previousTableId = order.getTableId();
        if (request.getCustomerId() != null) {
            order.setCustomerId(request.getCustomerId());
        }
        if (request.getTableId() != null) {
            order.setTableId(request.getTableId());
        }
        if (request.getOrderType() != null) {
            order.setOrderType(request.getOrderType());
        }
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        itemRepository.deleteByOrderId(order.getId());
        List<PosOrderItem> items = buildItems(order.getId(), request.getItems());
        applyKitchenStatus(order, items);
        itemRepository.saveAll(items);
        recalculateTotals(order, items);
        order = orderRepository.save(order);

        if (previousTableId != null && !previousTableId.equals(order.getTableId())) {
            tableService.setTableStatus(previousTableId, TableStatus.AVAILABLE);
        }
        occupyTable(order.getTableId());
        return OrderResponse.from(order, items);
    }

    @Transactional
    public OrderResponse pay(Long id, PayOrderRequest request) {
        PosOrder order = findEntity(id);
        if (order.getStatus() == OrderStatus.PAID) {
            throw AppException.badRequest("Order is already paid");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw AppException.badRequest(msg("pos.error.order_not_editable"));
        }
        validatePayment(request, order.getTotalAmount());

        User user = SecurityUtils.getCurrentUser();
        List<PosOrderItem> items = itemRepository.findByOrderId(order.getId());
        for (PosOrderItem item : items) {
            inventoryService.deductForSale(order.getBranchId(), item.getProductId(),
                    item.getQuantity(), order.getId(), user.getUsername());
        }

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .paymentMethod(request.getPaymentMethod())
                .amount(request.getAmount())
                .cashAmount(request.getCashAmount())
                .cardAmount(request.getCardAmount())
                .referenceNo(request.getReferenceNo())
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .createdBy(user.getUsername())
                .build();
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAID);
        order.setPaidAmount(request.getAmount());
        order.setPaidAt(LocalDateTime.now());
        if (isRestaurantOrder(order)) {
            order.setKitchenStatus("SERVED");
            items.forEach(i -> i.setKitchenStatus("SERVED"));
            itemRepository.saveAll(items);
        }
        orderRepository.save(order);
        releaseTable(order.getTableId());

        if (order.getShiftId() != null) {
            shiftService.addSaleToShift(order.getShiftId(), order.getTotalAmount());
        }

        return OrderResponse.from(order, items);
    }

    @Transactional
    public OrderResponse hold(Long id) {
        PosOrder order = findEntity(id);
        ensureEditable(order);
        order.setStatus(OrderStatus.HELD);
        order.setHeldAt(LocalDateTime.now());
        orderRepository.save(order);
        return OrderResponse.from(order, itemRepository.findByOrderId(order.getId()));
    }

    @Transactional
    public OrderResponse cancel(Long id) {
        PosOrder order = findEntity(id);
        if (order.getStatus() == OrderStatus.PAID) {
            throw AppException.badRequest(msg("pos.error.order_not_editable"));
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);
        releaseTable(order.getTableId());
        return OrderResponse.from(order, itemRepository.findByOrderId(order.getId()));
    }

    @Transactional
    public OrderResponse resume(Long id) {
        PosOrder order = findEntity(id);
        if (order.getStatus() != OrderStatus.HELD) {
            throw AppException.badRequest("Only held orders can be resumed");
        }
        order.setStatus(OrderStatus.PENDING);
        order.setHeldAt(null);
        orderRepository.save(order);
        occupyTable(order.getTableId());
        return OrderResponse.from(order, itemRepository.findByOrderId(order.getId()));
    }

    @Transactional
    public OrderResponse refund(Long id) {
        PosOrder order = findEntity(id);
        if (order.getStatus() != OrderStatus.PAID) {
            throw AppException.badRequest("Only paid orders can be refunded");
        }
        User user = SecurityUtils.getCurrentUser();
        List<PosOrderItem> items = itemRepository.findByOrderId(order.getId());
        for (PosOrderItem item : items) {
            inventoryService.restoreForRefund(order.getBranchId(), item.getProductId(),
                    item.getQuantity(), order.getId(), user.getUsername());
        }
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);
        releaseTable(order.getTableId());
        if (order.getShiftId() != null) {
            shiftService.subtractSaleFromShift(order.getShiftId(), order.getTotalAmount());
        }
        return OrderResponse.from(order, items);
    }

    public PosOrder findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("pos.error.order_not_found")));
    }

    private void ensureEditable(PosOrder order) {
        if (!EDITABLE.contains(order.getStatus())) {
            throw AppException.badRequest(msg("pos.error.order_not_editable"));
        }
    }

    private void validatePayment(PayOrderRequest request, BigDecimal totalAmount) {
        if (request.getAmount().compareTo(totalAmount) < 0) {
            throw AppException.badRequest(msg("pos.error.payment_insufficient"));
        }
        if (request.getPaymentMethod() == PaymentMethod.MIXED) {
            BigDecimal cash = request.getCashAmount() != null ? request.getCashAmount() : BigDecimal.ZERO;
            BigDecimal card = request.getCardAmount() != null ? request.getCardAmount() : BigDecimal.ZERO;
            if (cash.add(card).compareTo(request.getAmount()) != 0) {
                throw AppException.badRequest("Cash and card amounts must equal the total payment");
            }
        }
    }

    private List<PosOrderItem> buildItems(Long orderId, List<OrderItemRequest> requests) {
        LocalDateTime now = LocalDateTime.now();
        return requests.stream().map(req -> {
            Product product = productService.findEntity(req.getProductId());
            BigDecimal modifierAdj = resolveModifierAdjustment(req.getModifiersJson());
            BigDecimal unitPrice = product.getSellingPrice().add(modifierAdj);
            BigDecimal lineDiscount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = unitPrice.multiply(req.getQuantity()).subtract(lineDiscount);
            BigDecimal tax = lineSubtotal.multiply(product.getTaxRate())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            return PosOrderItem.builder()
                    .orderId(orderId)
                    .productId(product.getId())
                    .variantId(req.getVariantId())
                    .productName(product.getName())
                    .quantity(req.getQuantity())
                    .unitPrice(unitPrice)
                    .discountAmount(lineDiscount)
                    .taxAmount(tax)
                    .lineTotal(lineSubtotal.add(tax))
                    .notes(req.getNotes())
                    .modifiersJson(req.getModifiersJson())
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        }).toList();
    }

    private BigDecimal resolveModifierAdjustment(String modifiersJson) {
        if (modifiersJson == null || modifiersJson.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            JsonNode node = objectMapper.readTree(modifiersJson);
            BigDecimal total = BigDecimal.ZERO;
            if (node.isArray()) {
                for (JsonNode item : node) {
                    if (item.isNumber()) {
                        total = total.add(getModifierPrice(item.asLong()));
                    } else if (item.has("id")) {
                        total = total.add(getModifierPrice(item.get("id").asLong()));
                    }
                }
            }
            return total;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal getModifierPrice(Long modifierId) {
        return modifierRepository.findById(modifierId)
                .map(ProductModifier::getPriceAdjustment)
                .orElse(BigDecimal.ZERO);
    }

    private void recalculateTotals(PosOrder order, List<PosOrderItem> items) {
        BigDecimal subtotal = items.stream()
                .map(i -> i.getUnitPrice().multiply(i.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal itemDiscount = items.stream()
                .map(PosOrderItem::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = items.stream()
                .map(PosOrderItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal orderDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;

        order.setSubtotal(subtotal);
        order.setDiscountAmount(itemDiscount.add(orderDiscount));
        order.setTaxAmount(tax);
        order.setTotalAmount(subtotal.subtract(itemDiscount).subtract(orderDiscount).add(tax));
    }

    private void applyKitchenStatus(PosOrder order, List<PosOrderItem> items) {
        if (!isRestaurantOrder(order)) {
            return;
        }
        order.setKitchenStatus("PENDING");
        items.forEach(i -> i.setKitchenStatus("PENDING"));
    }

    private boolean isRestaurantOrder(PosOrder order) {
        return order.getOrderType() == OrderType.DINE_IN
                || order.getOrderType() == OrderType.TAKEAWAY
                || order.getOrderType() == OrderType.DELIVERY;
    }

    private void occupyTable(Long tableId) {
        if (tableId != null) {
            tableService.setTableStatus(tableId, TableStatus.OCCUPIED);
        }
    }

    private void releaseTable(Long tableId) {
        if (tableId != null) {
            tableService.setTableStatus(tableId, TableStatus.AVAILABLE);
        }
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "ORD-" + datePart + "-" + ORDER_SEQ.incrementAndGet();
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }
}
