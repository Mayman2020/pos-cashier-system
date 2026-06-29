package com.poscashier.modules.pos.entity;

import com.poscashier.shared.enums.OrderStatus;
import com.poscashier.shared.enums.OrderType;
import com.poscashier.shared.persistence.AuditableEntity;
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
@Table(name = "pos_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosOrder extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "shift_id")
    private Long shiftId;

    @Column(name = "cashier_id", nullable = false)
    private Long cashierId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "table_id")
    private Long tableId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType = OrderType.RETAIL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.DRAFT;

    @Column(name = "kitchen_status", length = 20)
    private String kitchenStatus;

    @Builder.Default
    @Column(precision = 14, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_amount", precision = 14, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_amount", precision = 14, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_amount", precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "paid_amount", precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(length = 1000)
    private String notes;

    @Column(name = "held_at")
    private LocalDateTime heldAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "discount_id")
    private Long discountId;

    @Column(name = "discount_code", length = 30)
    private String discountCode;

    @Builder.Default
    @Column(name = "loyalty_points_redeemed")
    private int loyaltyPointsRedeemed = 0;

    @Builder.Default
    @Column(name = "loyalty_points_earned")
    private int loyaltyPointsEarned = 0;

    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    @Column(name = "refunded_amount", precision = 14, scale = 2)
    private BigDecimal refundedAmount;
}
