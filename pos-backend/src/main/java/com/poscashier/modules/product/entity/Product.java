package com.poscashier.modules.product.entity;

import com.poscashier.shared.persistence.AuditableEntity;
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

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "unit_id")
    private Long unitId;

    @Builder.Default
    @Column(name = "cost_price", precision = 14, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "selling_price", precision = 14, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "track_stock")
    private boolean trackStock = true;

    @Builder.Default
    @Column(name = "low_stock_threshold", precision = 14, scale = 3)
    private BigDecimal lowStockThreshold = new BigDecimal("5");

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
