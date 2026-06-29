package com.poscashier.modules.product.repository;

import com.poscashier.modules.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdOrderByNameAsc(Long productId);

    Optional<ProductVariant> findBySku(String sku);
}
