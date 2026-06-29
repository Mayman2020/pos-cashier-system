package com.poscashier.modules.pos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.customer.service.LoyaltyService;
import com.poscashier.modules.discount.entity.Discount;
import com.poscashier.modules.discount.repository.DiscountRepository;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.modifier.entity.ProductModifier;
import com.poscashier.modules.modifier.repository.ProductModifierRepository;
import com.poscashier.modules.payment.entity.Payment;
import com.poscashier.modules.payment.repository.PaymentRepository;
import com.poscashier.modules.pos.dto.*;
import com.poscashier.modules.pos.entity.OrderNote;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.entity.PosOrderItem;
import com.poscashier.modules.pos.repository.OrderNoteRepository;
import com.poscashier.modules.pos.repository.PosOrderItemRepository;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.modules.product.entity.Product;
import com.poscashier.modules.product.entity.ProductVariant;
import com.poscashier.modules.product.service.ProductService;
import com.poscashier.modules.product.service.ProductVariantService;
import com.poscashier.modules.settings.service.SettingsService;
import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.modules.shift.service.ShiftService;
import com.poscashier.modules.table.service.TableService;
import com.poscashier.modules.tax.entity.Tax;
import com.poscashier.modules.tax.repository.TaxRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.DiscountType;
import com.poscashier.shared.enums.OrderStatus;
import com.poscashier.shared.enums.OrderType;
import com.poscashier.shared.enums.PaymentMethod;
import com.poscashier.shared.enums.TableStatus;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.BranchContext;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosOrderService {

    private static final Set<OrderStatus> EDITABLE = EnumSet.of(
            OrderStatus.DRAFT, OrderStatus.HELD, OrderStatus.PENDING);
    private static final Set<OrderStatus> PAYABLE = EnumSet.of(
            OrderStatus.PENDING);
    private static final AtomicLong ORDER_SEQ = new AtomicLong(System.currentTimeMillis() % 100000);

    private final PosOrderRepository orderRepository;
    private final PosOrderItemRepository itemRepository;
    private final OrderNoteRepository orderNoteRepository;
    private final PaymentRepository paymentRepository;
    private final ProductService productService;
    private final ProductVariantService variantService;
    private final ProductModifierRepository modifierRepository;
    private final ShiftService shiftService;
    private final InventoryService inventoryService;
    private final TableService tableService;
    private final DiscountRepository discountRepository;
    private final TaxRepository taxRepository;
    private final SettingsService settingsService;
    private final LoyaltyService loyaltyService;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<OrderResponse> list(Long branchId, OrderStatus status, String q, Pageable pageable) {
        Long resolved = branchId != null ? BranchContext.resolveBranchId(branchId) : BranchContext.resolveBranchId(null);
        String query = q == null ? null : q.trim();
        if (query == null || query.isEmpty()) {
            return orderRepository.searchNoQuery(resolved, status, pageable)
                    .map(o -> toResponse(o, itemRepository.findByOrderId(o.getId()), false));
        }
        return orderRepository.search(resolved, status, query, pageable)
                .map(o -> toResponse(o, itemRepository.findByOrderId(o.getId()), false));
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        return toResponse(order, itemRepository.findByOrderId(order.getId()), true);
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Shift shift = shiftService.getOpenShiftForCashier(user.getId());
        Long branchId = BranchContext.resolveBranchId(request.getBranchId());

        validateStockForItems(branchId, request.getItems());

        PosOrder order = PosOrder.builder()
                .orderNumber(generateOrderNumber())
                .branchId(branchId)
                .shiftId(shift.getId())
                .cashierId(user.getId())
                .customerId(request.getCustomerId())
                .tableId(request.getTableId())
                .orderType(request.getOrderType() != null ? request.getOrderType() : OrderType.RETAIL)
                .status(OrderStatus.PENDING)
                .notes(request.getNotes())
                .build();

        List<PosOrderItem> previewItems = buildItems(0L, request.getItems());
        applyDiscountAndLoyalty(order, request.getDiscountCode(), request.getDiscountAmount(),
                request.getLoyaltyPointsRedeemed(), previewItems);

        order = orderRepository.save(order);
        List<PosOrderItem> items = buildItems(order.getId(), request.getItems());
        applyKitchenStatus(order, items);
        itemRepository.saveAll(items);
        recalculateTotals(order, items);
        order = orderRepository.save(order);
        saveOrderNotes(order.getId(), request.getOrderNotes(), user.getUsername());
        occupyTable(order.getTableId());
        auditLogService.record("CREATE", "ORDER", order.getId(), order.getOrderNumber(), branchId);
        return toResponse(order, items, true);
    }

    @Transactional
    public OrderResponse update(Long id, UpdateOrderRequest request) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        ensureEditable(order);

        validateStockForItems(order.getBranchId(), request.getItems());

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
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        List<PosOrderItem> previewItems = buildItems(order.getId(), request.getItems());
        applyDiscountAndLoyalty(order, request.getDiscountCode(), request.getDiscountAmount(),
                request.getLoyaltyPointsRedeemed(), previewItems);

        itemRepository.deleteByOrderId(order.getId());
        List<PosOrderItem> items = buildItems(order.getId(), request.getItems());
        applyKitchenStatus(order, items);
        itemRepository.saveAll(items);
        recalculateTotals(order, items);
        order = orderRepository.save(order);

        if (previousTableId != null && !previousTableId.equals(order.getTableId())) {
            tableService.setTableStatus(previousTableId, TableStatus.AVAILABLE);
        }
        saveOrderNotes(order.getId(), request.getOrderNotes(), SecurityUtils.getCurrentUser().getUsername());
        occupyTable(order.getTableId());
        auditLogService.record("UPDATE", "ORDER", order.getId(), order.getOrderNumber(), order.getBranchId());
        return toResponse(order, items, true);
    }

    @Transactional
    public OrderResponse pay(Long id, PayOrderRequest request) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        if (order.getStatus() == OrderStatus.PAID) {
            throw AppException.badRequest("Order is already paid");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw AppException.badRequest(msg("pos.error.order_not_editable"));
        }
        if (!PAYABLE.contains(order.getStatus())) {
            throw AppException.badRequest("Order must be pending before payment");
        }
        validatePayment(request, order.getTotalAmount());

        User user = SecurityUtils.getCurrentUser();
        Shift openShift = shiftService.getOpenShiftForCashier(user.getId());
        if (order.getShiftId() == null || !order.getShiftId().equals(openShift.getId())) {
            order.setShiftId(openShift.getId());
        }
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
                .refund(false)
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

        if (order.getLoyaltyPointsRedeemed() > 0 && order.getCustomerId() != null) {
            loyaltyService.redeem(order.getCustomerId(), order.getId(), order.getLoyaltyPointsRedeemed(), user.getUsername());
        }
        int earned = loyaltyService.calculateEarnedPoints(order.getTotalAmount());
        order.setLoyaltyPointsEarned(earned);
        if (order.getCustomerId() != null && earned > 0) {
            loyaltyService.earn(order.getCustomerId(), order.getId(), earned, user.getUsername());
        }

        orderRepository.save(order);
        releaseTable(order.getTableId());

        if (order.getShiftId() != null) {
            shiftService.recordSale(openShift.getId(), request.getPaymentMethod(), order.getTotalAmount(),
                    request.getCashAmount(), request.getCardAmount());
        }

        auditLogService.record("PAY", "ORDER", order.getId(),
                "Paid " + order.getTotalAmount() + " via " + request.getPaymentMethod(), order.getBranchId());

        return toResponse(order, items, true);
    }

    @Transactional
    public OrderResponse hold(Long id) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        ensureEditable(order);
        order.setStatus(OrderStatus.HELD);
        order.setHeldAt(LocalDateTime.now());
        orderRepository.save(order);
        auditLogService.record("HOLD", "ORDER", order.getId(), order.getOrderNumber(), order.getBranchId());
        return toResponse(order, itemRepository.findByOrderId(order.getId()), false);
    }

    @Transactional
    public OrderResponse cancel(Long id) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        if (order.getStatus() == OrderStatus.PAID) {
            throw AppException.badRequest(msg("pos.error.order_not_editable"));
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);
        releaseTable(order.getTableId());
        auditLogService.record("CANCEL", "ORDER", order.getId(), order.getOrderNumber(), order.getBranchId());
        return toResponse(order, itemRepository.findByOrderId(order.getId()), false);
    }

    @Transactional
    public OrderResponse resume(Long id) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        if (order.getStatus() != OrderStatus.HELD) {
            throw AppException.badRequest("Only held orders can be resumed");
        }
        order.setStatus(OrderStatus.PENDING);
        order.setHeldAt(null);
        orderRepository.save(order);
        occupyTable(order.getTableId());
        return toResponse(order, itemRepository.findByOrderId(order.getId()), false);
    }

    @Transactional
    public OrderResponse refund(Long id, RefundOrderRequest request) {
        PosOrder order = findEntity(id);
        BranchContext.assertBranchAccess(order.getBranchId());
        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.PARTIALLY_REFUNDED) {
            throw AppException.badRequest("Only paid orders can be refunded");
        }

        User user = SecurityUtils.getCurrentUser();
        List<PosOrderItem> items = itemRepository.findByOrderId(order.getId());
        Payment originalPayment = paymentRepository.findByOrderIdAndRefundFalse(order.getId()).stream()
                .findFirst()
                .orElseThrow(() -> AppException.badRequest("No payment found for order"));

        BigDecimal alreadyRefunded = order.getRefundedAmount() != null ? order.getRefundedAmount() : BigDecimal.ZERO;
        boolean requestAllLines = request == null || request.getItems() == null || request.getItems().isEmpty();
        PaymentMethod refundMethod = request != null && request.getRefundMethod() != null
                ? request.getRefundMethod() : originalPayment.getPaymentMethod();

        BigDecimal refundAmount;
        boolean fullyRefunded;

        if (requestAllLines) {
            refundAmount = BigDecimal.ZERO;
            for (PosOrderItem item : items) {
                BigDecimal refunded = item.getRefundedQuantity() != null ? item.getRefundedQuantity() : BigDecimal.ZERO;
                BigDecimal remaining = item.getQuantity().subtract(refunded);
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }
                BigDecimal lineRefund = lineRefundAmount(item, remaining);
                refundAmount = refundAmount.add(lineRefund);
                inventoryService.restoreForRefund(order.getBranchId(), item.getProductId(),
                        remaining, order.getId(), user.getUsername());
                item.setRefundedQuantity(item.getQuantity());
            }
            if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw AppException.badRequest("No refundable quantity remaining");
            }
            fullyRefunded = items.stream().allMatch(i -> {
                BigDecimal refunded = i.getRefundedQuantity() != null ? i.getRefundedQuantity() : BigDecimal.ZERO;
                return refunded.compareTo(i.getQuantity()) >= 0;
            });
            order.setStatus(fullyRefunded ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED);
            itemRepository.saveAll(items);
        } else {
            Map<Long, PosOrderItem> itemMap = items.stream()
                    .collect(Collectors.toMap(PosOrderItem::getId, Function.identity()));
            refundAmount = BigDecimal.ZERO;
            for (RefundItemRequest ri : request.getItems()) {
                PosOrderItem item = itemMap.get(ri.getOrderItemId());
                if (item == null) {
                    throw AppException.badRequest("Invalid order item for refund");
                }
                BigDecimal refunded = item.getRefundedQuantity() != null ? item.getRefundedQuantity() : BigDecimal.ZERO;
                BigDecimal remaining = item.getQuantity().subtract(refunded);
                if (ri.getQuantity().compareTo(remaining) > 0) {
                    throw AppException.badRequest("Refund quantity exceeds remaining refundable quantity");
                }
                BigDecimal lineRefund = lineRefundAmount(item, ri.getQuantity());
                refundAmount = refundAmount.add(lineRefund);
                inventoryService.restoreForRefund(order.getBranchId(), item.getProductId(),
                        ri.getQuantity(), order.getId(), user.getUsername());
                item.setRefundedQuantity(refunded.add(ri.getQuantity()));
            }
            itemRepository.saveAll(items);
            fullyRefunded = items.stream().allMatch(i -> {
                BigDecimal r = i.getRefundedQuantity() != null ? i.getRefundedQuantity() : BigDecimal.ZERO;
                return r.compareTo(i.getQuantity()) >= 0;
            });
            order.setStatus(fullyRefunded ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED);
        }

        if (alreadyRefunded.add(refundAmount).compareTo(order.getTotalAmount()) > 0) {
            throw AppException.badRequest("Refund amount exceeds order total");
        }

        order.setRefundReason(request != null ? request.getReason() : null);
        order.setRefundedAmount(
                (order.getRefundedAmount() != null ? order.getRefundedAmount() : BigDecimal.ZERO).add(refundAmount));
        orderRepository.save(order);
        releaseTable(order.getTableId());

        BigDecimal cashPortion = resolveRefundCash(refundMethod, refundAmount, originalPayment);
        BigDecimal cardPortion = refundAmount.subtract(cashPortion);

        Payment refundPayment = Payment.builder()
                .orderId(order.getId())
                .paymentMethod(refundMethod)
                .amount(refundAmount.negate())
                .cashAmount(cashPortion.negate())
                .cardAmount(cardPortion.negate())
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .createdBy(user.getUsername())
                .refund(true)
                .build();
        paymentRepository.save(refundPayment);

        if (order.getShiftId() != null) {
            shiftService.recordRefund(order.getShiftId(), refundMethod, refundAmount, cashPortion, cardPortion);
        }

        if (order.getCustomerId() != null) {
            adjustLoyaltyOnRefund(order, refundAmount, fullyRefunded);
        }

        auditLogService.record("REFUND", "ORDER", order.getId(),
                "Refunded " + refundAmount, order.getBranchId());

        return toResponse(order, items, true);
    }

    private BigDecimal lineRefundAmount(PosOrderItem item, BigDecimal quantity) {
        if (item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal ratio = quantity.divide(item.getQuantity(), 6, RoundingMode.HALF_UP);
        return item.getLineTotal().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
    }

    private void adjustLoyaltyOnRefund(PosOrder order, BigDecimal refundAmount, boolean fullyRefunded) {
        String username = SecurityUtils.getCurrentUser().getUsername();
        if (fullyRefunded && order.getLoyaltyPointsRedeemed() > 0) {
            loyaltyService.restoreRedeemed(order.getCustomerId(), order.getId(),
                    order.getLoyaltyPointsRedeemed(), username);
        }
        if (order.getLoyaltyPointsEarned() > 0) {
            int pointsToReverse = fullyRefunded
                    ? order.getLoyaltyPointsEarned()
                    : loyaltyService.calculateEarnedPoints(refundAmount);
            if (pointsToReverse > 0) {
                loyaltyService.reverseEarn(order.getCustomerId(), order.getId(), pointsToReverse, username);
            }
        }
    }

    public PosOrder findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("pos.error.order_not_found")));
    }

    private void validateStockForItems(Long branchId, List<OrderItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }
        Map<Long, BigDecimal> needed = new HashMap<>();
        for (OrderItemRequest req : requests) {
            needed.merge(req.getProductId(), req.getQuantity(), BigDecimal::add);
        }
        needed.forEach((productId, qty) -> inventoryService.assertAvailable(branchId, productId, qty));
    }

    private void applyDiscountAndLoyalty(PosOrder order, String discountCode, BigDecimal manualDiscount,
                                         Integer loyaltyPointsRedeemed, List<PosOrderItem> items) {
        BigDecimal subtotal = items.stream()
                .map(i -> i.getUnitPrice().multiply(i.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal orderDiscount = BigDecimal.ZERO;

        if (discountCode != null && !discountCode.isBlank()) {
            Discount discount = discountRepository.findByCode(discountCode)
                    .filter(Discount::isActive)
                    .orElseThrow(() -> AppException.badRequest("Invalid or inactive discount code"));
            order.setDiscountId(discount.getId());
            order.setDiscountCode(discount.getCode());
            if (discount.getDiscountType() == DiscountType.PERCENT) {
                orderDiscount = subtotal.multiply(discount.getValue())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            } else {
                orderDiscount = discount.getValue().min(subtotal);
            }
        } else if (manualDiscount != null && manualDiscount.compareTo(BigDecimal.ZERO) > 0) {
            if (!settingsService.getBoolean("allow_manual_discount", true)
                    && !SecurityUtils.hasRole(SecurityUtils.getCurrentUser(), "MANAGER")
                    && !SecurityUtils.hasRole(SecurityUtils.getCurrentUser(), "ADMIN")) {
                throw AppException.forbidden("Manual discount not allowed");
            }
            orderDiscount = manualDiscount.min(subtotal);
            order.setDiscountId(null);
            order.setDiscountCode(null);
        } else {
            order.setDiscountId(null);
            order.setDiscountCode(null);
        }

        int redeemPoints = loyaltyPointsRedeemed != null ? loyaltyPointsRedeemed : 0;
        if (redeemPoints > 0) {
            BigDecimal loyaltyDiscount = loyaltyService.calculateRedeemDiscount(redeemPoints);
            orderDiscount = orderDiscount.add(loyaltyDiscount);
        }
        order.setDiscountAmount(orderDiscount);
        order.setLoyaltyPointsRedeemed(redeemPoints);
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
        boolean taxInclusive = settingsService.getBoolean("tax_inclusive", false);
        LocalDateTime now = LocalDateTime.now();
        return requests.stream().map(req -> {
            Product product = productService.findEntity(req.getProductId());
            BigDecimal modifierAdj = resolveModifierAdjustment(req.getModifiersJson());
            BigDecimal unitPrice = product.getSellingPrice().add(modifierAdj);
            String productName = product.getName();

            if (req.getVariantId() != null) {
                ProductVariant variant = variantService.findEntity(req.getVariantId());
                if (!variant.getProductId().equals(product.getId())) {
                    throw AppException.badRequest("Variant does not belong to product");
                }
                if (!variant.isActive()) {
                    throw AppException.badRequest("Variant is not active");
                }
                unitPrice = variant.getSellingPrice().add(modifierAdj);
                productName = product.getName() + " - " + variant.getName();
            }

            BigDecimal lineDiscount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal taxRate = resolveTaxRate(product);
            BigDecimal lineSubtotal = unitPrice.multiply(req.getQuantity()).subtract(lineDiscount);
            BigDecimal tax = calculateTax(lineSubtotal, taxRate, taxInclusive);
            BigDecimal lineTotal = taxInclusive ? lineSubtotal : lineSubtotal.add(tax);

            return PosOrderItem.builder()
                    .orderId(orderId)
                    .productId(product.getId())
                    .variantId(req.getVariantId())
                    .productName(productName)
                    .quantity(req.getQuantity())
                    .unitPrice(unitPrice)
                    .discountAmount(lineDiscount)
                    .taxAmount(tax)
                    .lineTotal(lineTotal)
                    .notes(req.getNotes())
                    .modifiersJson(req.getModifiersJson())
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        }).toList();
    }

    private BigDecimal resolveTaxRate(Product product) {
        if (product.getTaxId() != null) {
            return taxRepository.findById(product.getTaxId())
                    .filter(Tax::isActive)
                    .map(Tax::getRate)
                    .orElse(product.getTaxRate());
        }
        return product.getTaxRate() != null ? product.getTaxRate() : BigDecimal.ZERO;
    }

    private BigDecimal calculateTax(BigDecimal lineSubtotal, BigDecimal taxRate, boolean taxInclusive) {
        if (taxRate == null || taxRate.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (taxInclusive) {
            BigDecimal divisor = BigDecimal.ONE.add(taxRate.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP));
            return lineSubtotal.subtract(lineSubtotal.divide(divisor, 2, RoundingMode.HALF_UP));
        }
        return lineSubtotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
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
        boolean taxInclusive = settingsService.getBoolean("tax_inclusive", false);
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
        BigDecimal netBeforeTax = subtotal.subtract(itemDiscount).subtract(orderDiscount).max(BigDecimal.ZERO);
        BigDecimal originalNet = subtotal.subtract(itemDiscount);
        BigDecimal scaledTax = originalNet.compareTo(BigDecimal.ZERO) > 0
                ? tax.multiply(netBeforeTax).divide(originalNet, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        order.setTaxAmount(scaledTax);
        order.setTotalAmount(taxInclusive ? netBeforeTax : netBeforeTax.add(scaledTax));
    }

    private BigDecimal resolveRefundCash(PaymentMethod method, BigDecimal amount, Payment original) {
        return switch (method) {
            case CASH -> amount;
            case CARD, OTHER -> BigDecimal.ZERO;
            case MIXED -> {
                if (original.getCashAmount() != null && original.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal ratio = original.getCashAmount().divide(original.getAmount(), 6, RoundingMode.HALF_UP);
                    yield amount.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                }
                yield amount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
            }
        };
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

    private OrderResponse toResponse(PosOrder order, List<PosOrderItem> items, boolean includeNotes) {
        List<OrderNote> notes = includeNotes
                ? orderNoteRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                : List.of();
        return OrderResponse.from(order, items, notes);
    }

    private void saveOrderNotes(Long orderId, List<OrderNoteRequest> requests, String username) {
        if (requests == null) {
            return;
        }
        orderNoteRepository.deleteByOrderId(orderId);
        LocalDateTime now = LocalDateTime.now();
        for (OrderNoteRequest req : requests) {
            if (req.getNote() == null || req.getNote().isBlank()) {
                continue;
            }
            orderNoteRepository.save(OrderNote.builder()
                    .orderId(orderId)
                    .itemId(req.getItemId())
                    .note(req.getNote().trim())
                    .createdAt(now)
                    .createdBy(username)
                    .build());
        }
    }
}
