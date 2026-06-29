package com.poscashier.modules.purchase.service;

import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.inventory.dto.StockInRequest;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.product.service.ProductService;
import com.poscashier.modules.purchase.dto.*;
import com.poscashier.modules.purchase.entity.PurchaseOrder;
import com.poscashier.modules.purchase.entity.PurchaseOrderItem;
import com.poscashier.modules.purchase.repository.PurchaseOrderItemRepository;
import com.poscashier.modules.purchase.repository.PurchaseOrderRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.PurchaseOrderStatus;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.BranchContext;
import com.poscashier.shared.util.SecurityUtils;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository itemRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> list(Long branchId, PurchaseOrderStatus status, Pageable pageable) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        Page<PurchaseOrder> page = status != null
                ? purchaseOrderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(resolved, status, pageable)
                : purchaseOrderRepository.findByBranchIdOrderByCreatedAtDesc(resolved, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public PurchaseOrderResponse create(Long branchId, PurchaseOrderRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Long resolved = BranchContext.resolveBranchId(branchId);
        PurchaseOrder po = PurchaseOrder.builder()
                .branchId(resolved)
                .supplierId(request.getSupplierId())
                .status(request.getStatus() != null ? request.getStatus() : PurchaseOrderStatus.DRAFT)
                .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now())
                .expectedDate(request.getExpectedDate())
                .invoiceNo(request.getInvoiceNo())
                .notes(request.getNotes())
                .totalAmount(calculateTotal(request.getItems()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(user.getUsername())
                .build();
        po = purchaseOrderRepository.save(po);
        saveItems(po.getId(), request.getItems());
        auditLogService.record("CREATE", "PURCHASE_ORDER", po.getId(), "PO created", resolved);
        return getById(po.getId());
    }

    @Transactional
    public PurchaseOrderResponse update(Long id, PurchaseOrderRequest request) {
        PurchaseOrder po = findEntity(id);
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw AppException.badRequest("Cannot edit purchase order in status " + po.getStatus());
        }
        po.setSupplierId(request.getSupplierId());
        if (request.getStatus() != null) {
            po.setStatus(request.getStatus());
        }
        po.setOrderDate(request.getOrderDate());
        po.setExpectedDate(request.getExpectedDate());
        po.setInvoiceNo(request.getInvoiceNo());
        po.setNotes(request.getNotes());
        po.setTotalAmount(calculateTotal(request.getItems()));
        po.setUpdatedAt(LocalDateTime.now());
        itemRepository.deleteByPurchaseOrderId(po.getId());
        saveItems(po.getId(), request.getItems());
        purchaseOrderRepository.save(po);
        auditLogService.record("UPDATE", "PURCHASE_ORDER", po.getId(), "PO updated", po.getBranchId());
        return getById(po.getId());
    }

    @Transactional
    public PurchaseOrderResponse receive(Long id) {
        PurchaseOrder po = findEntity(id);
        if (po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw AppException.badRequest("Cannot receive cancelled PO");
        }
        List<PurchaseOrderItem> items = itemRepository.findByPurchaseOrderId(po.getId());
        for (PurchaseOrderItem item : items) {
            BigDecimal remaining = item.getQuantity().subtract(item.getReceivedQuantity());
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            StockInRequest stockIn = new StockInRequest();
            stockIn.setProductId(item.getProductId());
            stockIn.setQuantity(remaining);
            stockIn.setBranchId(po.getBranchId());
            stockIn.setSupplierId(po.getSupplierId());
            stockIn.setInvoiceNo(po.getInvoiceNo());
            stockIn.setNotes("PO #" + po.getId() + " receive");
            inventoryService.stockIn(stockIn);
            item.setReceivedQuantity(item.getReceivedQuantity().add(remaining));
            itemRepository.save(item);
        }
        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setUpdatedAt(LocalDateTime.now());
        purchaseOrderRepository.save(po);
        auditLogService.record("RECEIVE", "PURCHASE_ORDER", po.getId(), "PO received into stock", po.getBranchId());
        return getById(po.getId());
    }

    @Transactional
    public void cancel(Long id) {
        PurchaseOrder po = findEntity(id);
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw AppException.badRequest("Cannot cancel received PO");
        }
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        po.setUpdatedAt(LocalDateTime.now());
        purchaseOrderRepository.save(po);
        auditLogService.record("CANCEL", "PURCHASE_ORDER", po.getId(), "PO cancelled", po.getBranchId());
    }

    private void saveItems(Long poId, List<PurchaseOrderItemRequest> items) {
        for (PurchaseOrderItemRequest req : items) {
            itemRepository.save(PurchaseOrderItem.builder()
                    .purchaseOrderId(poId)
                    .productId(req.getProductId())
                    .quantity(req.getQuantity())
                    .unitCost(req.getUnitCost())
                    .receivedQuantity(BigDecimal.ZERO)
                    .build());
        }
    }

    private BigDecimal calculateTotal(List<PurchaseOrderItemRequest> items) {
        return items.stream()
                .map(i -> i.getUnitCost().multiply(i.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> items = itemRepository.findByPurchaseOrderId(po.getId()).stream()
                .map(item -> {
                    String name = productService.findEntity(item.getProductId()).getName();
                    return PurchaseOrderItemResponse.from(item, name);
                })
                .toList();
        return PurchaseOrderResponse.from(po, items);
    }

    private PurchaseOrder findEntity(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Purchase order not found"));
        Long resolved = BranchContext.resolveBranchId(null);
        if (!po.getBranchId().equals(resolved) && !SecurityUtils.hasRole(SecurityUtils.getCurrentUser(), "ADMIN")) {
            throw AppException.forbidden("Access denied to this purchase order");
        }
        return po;
    }
}
