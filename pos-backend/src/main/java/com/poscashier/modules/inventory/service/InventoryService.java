package com.poscashier.modules.inventory.service;

import com.poscashier.modules.inventory.dto.InventoryBalanceResponse;
import com.poscashier.modules.inventory.dto.StockAdjustRequest;
import com.poscashier.modules.inventory.dto.StockAvailabilityResponse;
import com.poscashier.modules.inventory.dto.StockInRequest;
import com.poscashier.modules.inventory.dto.StockMovementResponse;
import com.poscashier.modules.inventory.dto.StockTransferRequest;
import com.poscashier.modules.inventory.entity.InventoryBalance;
import com.poscashier.modules.inventory.entity.StockMovement;
import com.poscashier.modules.inventory.repository.InventoryBalanceRepository;
import com.poscashier.modules.inventory.repository.StockMovementRepository;
import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.product.entity.Product;
import com.poscashier.modules.product.service.ProductService;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.MovementType;
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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryBalanceRepository balanceRepository;
    private final StockMovementRepository movementRepository;
    private final ProductService productService;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;

    @Transactional(readOnly = true)
    public Page<InventoryBalanceResponse> listBalances(Long branchId, Pageable pageable) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        return balanceRepository.findByBranch(resolved, pageable)
                .map(b -> toBalanceResponse(b));
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> listMovements(Long branchId, Long productId, Pageable pageable) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        return movementRepository.search(resolved, productId, pageable).map(StockMovementResponse::from);
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceResponse> lowStock(Long branchId) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        return balanceRepository.findByBranchId(resolved).stream()
                .map(this::toBalanceResponse)
                .filter(r -> r.getLowStockThreshold() != null
                        && r.getQuantity().compareTo(r.getLowStockThreshold()) <= 0)
                .toList();
    }

    @Transactional
    public StockMovementResponse stockIn(StockInRequest request) {
        Long branchId = BranchContext.resolveBranchId(request.getBranchId());
        validateQuantity(request.getQuantity());
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        adjustBalance(branchId, request.getProductId(), request.getQuantity());
        StockMovement movement = recordMovement(branchId, request.getProductId(),
                MovementType.STOCK_IN, request.getQuantity(), null, null, request.getNotes(), user.getUsername());
        movement.setSupplierId(request.getSupplierId());
        movement.setInvoiceNo(request.getInvoiceNo());
        movement.setInvoiceDate(request.getInvoiceDate());
        StockMovement saved = movementRepository.save(movement);
        auditLogService.record("STOCK_IN", "PRODUCT", request.getProductId(),
                "Qty " + request.getQuantity(), branchId);
        return StockMovementResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public StockAvailabilityResponse getAvailability(Long branchId, Long productId) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        Product product = productService.findEntity(productId);
        if (!product.isTrackStock()) {
            return StockAvailabilityResponse.builder()
                    .productId(productId)
                    .branchId(resolved)
                    .available(BigDecimal.valueOf(999999))
                    .trackStock(false)
                    .lowStock(false)
                    .build();
        }
        BigDecimal qty = balanceRepository.findByBranchIdAndProductId(resolved, productId)
                .map(InventoryBalance::getQuantity)
                .orElse(BigDecimal.ZERO);
        return StockAvailabilityResponse.builder()
                .productId(productId)
                .branchId(resolved)
                .available(qty)
                .trackStock(true)
                .lowStock(qty.compareTo(product.getLowStockThreshold()) <= 0)
                .build();
    }

    @Transactional(readOnly = true)
    public void assertAvailable(Long branchId, Long productId, BigDecimal quantity) {
        StockAvailabilityResponse availability = getAvailability(branchId, productId);
        if (!availability.isTrackStock()) {
            return;
        }
        if (availability.getAvailable().compareTo(quantity) < 0) {
            throw AppException.badRequest(msg("pos.error.insufficient_stock"));
        }
    }

    @Transactional
    public StockMovementResponse adjust(StockAdjustRequest request) {
        Long branchId = BranchContext.resolveBranchId(request.getBranchId());
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        InventoryBalance balance = getOrCreateBalance(branchId, request.getProductId());
        BigDecimal delta = request.getQuantity().subtract(balance.getQuantity());
        balance.setQuantity(request.getQuantity());
        balance.setUpdatedAt(LocalDateTime.now());
        balanceRepository.save(balance);
        StockMovement movement = recordMovement(branchId, request.getProductId(),
                MovementType.ADJUSTMENT, delta.abs(), null, null, request.getNotes(), user.getUsername());
        auditLogService.record("ADJUST", "PRODUCT", request.getProductId(),
                "New qty " + request.getQuantity(), branchId);
        return StockMovementResponse.from(movement);
    }

    @Transactional
    public StockMovementResponse transfer(StockTransferRequest request) {
        validateQuantity(request.getQuantity());
        Long fromBranchId = BranchContext.resolveBranchId(request.getFromBranchId());
        Long toBranchId = BranchContext.resolveBranchId(request.getToBranchId());
        if (fromBranchId.equals(toBranchId)) {
            throw AppException.badRequest("Source and destination branches must differ");
        }
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        reduceBalance(fromBranchId, request.getProductId(), request.getQuantity());
        adjustBalance(toBranchId, request.getProductId(), request.getQuantity());
        recordMovement(fromBranchId, request.getProductId(),
                MovementType.TRANSFER_OUT, request.getQuantity(), "TRANSFER", null, request.getNotes(), user.getUsername());
        StockMovement inMovement = recordMovement(toBranchId, request.getProductId(),
                MovementType.TRANSFER_IN, request.getQuantity(), "TRANSFER", null, request.getNotes(), user.getUsername());
        auditLogService.record("TRANSFER", "PRODUCT", request.getProductId(),
                "From branch " + fromBranchId + " to " + toBranchId + " qty " + request.getQuantity(), fromBranchId);
        return StockMovementResponse.from(inMovement);
    }

    @Transactional
    public void deductForSale(Long branchId, Long productId, BigDecimal quantity, Long orderId, String username) {
        Product product = productService.findEntity(productId);
        if (!product.isTrackStock()) {
            return;
        }
        reduceBalance(branchId, productId, quantity);
        recordMovement(branchId, productId, MovementType.SALE, quantity, "ORDER", orderId, null, username);
    }

    @Transactional
    public void restoreForRefund(Long branchId, Long productId, BigDecimal quantity, Long orderId, String username) {
        Product product = productService.findEntity(productId);
        if (!product.isTrackStock()) {
            return;
        }
        adjustBalance(branchId, productId, quantity);
        recordMovement(branchId, productId, MovementType.RETURN, quantity, "ORDER", orderId, "Refund", username);
    }

    private void adjustBalance(Long branchId, Long productId, BigDecimal quantity) {
        InventoryBalance balance = getOrCreateBalance(branchId, productId);
        balance.setQuantity(balance.getQuantity().add(quantity));
        balance.setUpdatedAt(LocalDateTime.now());
        balanceRepository.save(balance);
    }

    private void reduceBalance(Long branchId, Long productId, BigDecimal quantity) {
        InventoryBalance balance = balanceRepository.findByBranchIdAndProductId(branchId, productId)
                .orElseThrow(() -> AppException.badRequest(msg("inventory.error.balance_not_found")));
        if (balance.getQuantity().compareTo(quantity) < 0) {
            throw AppException.badRequest(msg("pos.error.insufficient_stock"));
        }
        balance.setQuantity(balance.getQuantity().subtract(quantity));
        balance.setUpdatedAt(LocalDateTime.now());
        balanceRepository.save(balance);
    }

    private InventoryBalance getOrCreateBalance(Long branchId, Long productId) {
        return balanceRepository.findByBranchIdAndProductId(branchId, productId)
                .orElseGet(() -> balanceRepository.save(InventoryBalance.builder()
                        .branchId(branchId)
                        .productId(productId)
                        .quantity(BigDecimal.ZERO)
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private StockMovement recordMovement(Long branchId, Long productId, MovementType type, BigDecimal quantity,
                                         String refType, Long refId, String notes, String createdBy) {
        return movementRepository.save(StockMovement.builder()
                .branchId(branchId)
                .productId(productId)
                .movementType(type)
                .quantity(quantity)
                .referenceType(refType)
                .referenceId(refId)
                .notes(notes)
                .createdAt(LocalDateTime.now())
                .createdBy(createdBy)
                .build());
    }

    private InventoryBalanceResponse toBalanceResponse(InventoryBalance balance) {
        Product product = productService.findEntity(balance.getProductId());
        if (!product.isTrackStock()) {
            return InventoryBalanceResponse.from(balance, product.getName(), product.getSku(), null);
        }
        return InventoryBalanceResponse.from(balance, product.getName(), product.getSku(), product.getLowStockThreshold());
    }

    private void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw AppException.badRequest(msg("inventory.error.invalid_quantity"));
        }
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }
}
