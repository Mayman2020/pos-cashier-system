package com.poscashier.modules.pos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "pos_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Builder.Default
    @Column(precision = 14, scale = 3)
    private BigDecimal quantity = BigDecimal.ONE;

    @Builder.Default
    @Column(name = "refunded_quantity", precision = 14, scale = 3)
    private BigDecimal refundedQuantity = BigDecimal.ZERO;

    @Column(name = "unit_price", precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Builder.Default
    @Column(name = "discount_amount", precision = 14, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_amount", precision = 14, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "line_total", precision = 14, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "kitchen_status", length = 20)
    private String kitchenStatus;

    @Column(length = 500)
    private String notes;

    @Column(name = "modifiers_json", columnDefinition = "TEXT")
    private String modifiersJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
