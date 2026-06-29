package com.poscashier.modules.shift.entity;

import com.poscashier.shared.enums.ShiftStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "cashier_id", nullable = false)
    private Long cashierId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private ShiftStatus status = ShiftStatus.OPEN;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Builder.Default
    @Column(name = "opening_cash", precision = 14, scale = 2)
    private BigDecimal openingCash = BigDecimal.ZERO;

    @Column(name = "expected_cash", precision = 14, scale = 2)
    private BigDecimal expectedCash;

    @Column(name = "actual_cash", precision = 14, scale = 2)
    private BigDecimal actualCash;

    @Column(name = "cash_difference", precision = 14, scale = 2)
    private BigDecimal cashDifference;

    @Builder.Default
    @Column(name = "total_sales", precision = 14, scale = 2)
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_cash_sales", precision = 14, scale = 2)
    private BigDecimal totalCashSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_card_sales", precision = 14, scale = 2)
    private BigDecimal totalCardSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_refunds_cash", precision = 14, scale = 2)
    private BigDecimal totalRefundsCash = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_refunds_card", precision = 14, scale = 2)
    private BigDecimal totalRefundsCard = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_payouts", precision = 14, scale = 2)
    private BigDecimal totalPayouts = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
