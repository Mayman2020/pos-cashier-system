package com.poscashier.modules.product.entity;

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
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(unique = true, nullable = false, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(nullable = false, length = 200)
    private String name;

    @Builder.Default
    @Column(name = "cost_price", precision = 14, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "selling_price", precision = 14, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
