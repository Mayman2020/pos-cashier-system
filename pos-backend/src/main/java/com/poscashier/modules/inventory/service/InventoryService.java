package com.poscashier.modules.inventory.service;

import com.poscashier.modules.inventory.dto.InventoryBalanceResponse;
import com.poscashier.modules.inventory.dto.StockAdjustRequest;
import com.poscashier.modules.inventory.dto.StockInRequest;
import com.poscashier.modules.inventory.dto.StockMovementResponse;
import com.poscashier.modules.inventory.dto.StockTransferRequest;
import com.poscashier.modules.inventory.entity.InventoryBalance;
import com.poscashier.modules.inventory.entity.StockMovement;
import com.poscashier.modules.inventory.repository.InventoryBalanceRepository;
import com.poscashier.modules.inventory.repository.StockMovementRepository;
import com.poscashier.modules.product.entity.Product;
import com.poscashier.modules.product.service.ProductService;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.MovementType;
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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryBalanceRepository balanceRepository;
    private final StockMovementRepository movementRepository;
    private final ProductService productService;
    private final MessageSource messageSource;

    @Transactional(readOnly = true)
    public Page<InventoryBalanceResponse> listBalances(Long branchId, Pageable pageable) {
        return balanceRepository.findByBranch(branchId, pageable)
                .map(b -> toBalanceResponse(b));
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> listMovements(Long branchId, Long productId, Pageable pageable) {
        return movementRepository.search(branchId, productId, pageable).map(StockMovementResponse::from);
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceResponse> lowStock(Long branchId) {
        List<InventoryBalance> balances = branchId != null
                ? balanceRepository.findByBranchId(branchId)
                : balanceRepository.findAll();
        return balances.stream()
                .map(this::toBalanceResponse)
                .filter(r -> r.getLowStockThreshold() != null
                        && r.getQuantity().compareTo(r.getLowStockThreshold()) <= 0)
                .toList();
    }

    @Transactional
    public StockMovementResponse stockIn(StockInRequest request) {
        validateQuantity(request.getQuantity());
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        adjustBalance(request.getBranchId(), request.getProductId(), request.getQuantity());
        StockMovement movement = recordMovement(request.getBranchId(), request.getProductId(),
                MovementType.STOCK_IN, request.getQuantity(), null, null, request.getNotes(), user.getUsername());
        return StockMovementResponse.from(movement);
    }

    @Transactional
    public StockMovementResponse adjust(StockAdjustRequest request) {
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        InventoryBalance balance = getOrCreateBalance(request.getBranchId(), request.getProductId());
        BigDecimal delta = request.getQuantity().subtract(balance.getQuantity());
        balance.setQuantity(request.getQuantity());
        balance.setUpdatedAt(LocalDateTime.now());
        balanceRepository.save(balance);
        StockMovement movement = recordMovement(request.getBranchId(), request.getProductId(),
                MovementType.ADJUSTMENT, delta.abs(), null, null, request.getNotes(), user.getUsername());
        return StockMovementResponse.from(movement);
    }

    @Transactional
    public StockMovementResponse transfer(StockTransferRequest request) {
        validateQuantity(request.getQuantity());
        if (request.getFromBranchId().equals(request.getToBranchId())) {
            throw AppException.badRequest("Source and destination branches must differ");
        }
        productService.findEntity(request.getProductId());
        User user = SecurityUtils.getCurrentUser();
        reduceBalance(request.getFromBranchId(), request.getProductId(), request.getQuantity());
        adjustBalance(request.getToBranchId(), request.getProductId(), request.getQuantity());
        recordMovement(request.getFromBranchId(), request.getProductId(),
                MovementType.TRANSFER_OUT, request.getQuantity(), "TRANSFER", null, request.getNotes(), user.getUsername());
        StockMovement inMovement = recordMovement(request.getToBranchId(), request.getProductId(),
                MovementType.TRANSFER_IN, request.getQuantity(), "TRANSFER", null, request.getNotes(), user.getUsername());
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
