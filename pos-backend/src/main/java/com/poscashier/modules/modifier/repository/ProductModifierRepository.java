package com.poscashier.modules.modifier.repository;

import com.poscashier.modules.modifier.entity.ProductModifier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductModifierRepository extends JpaRepository<ProductModifier, Long> {

    List<ProductModifier> findByProductId(Long productId);

    List<ProductModifier> findByProductIdIsNull();
}
