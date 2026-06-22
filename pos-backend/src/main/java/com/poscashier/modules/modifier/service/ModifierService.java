package com.poscashier.modules.modifier.service;

import com.poscashier.modules.modifier.dto.ModifierRequest;
import com.poscashier.modules.modifier.dto.ModifierResponse;
import com.poscashier.modules.modifier.entity.ProductModifier;
import com.poscashier.modules.modifier.repository.ProductModifierRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModifierService {

    private final ProductModifierRepository modifierRepository;

    @Transactional(readOnly = true)
    public List<ModifierResponse> list(Long productId) {
        List<ProductModifier> modifiers = productId != null
                ? modifierRepository.findByProductId(productId)
                : modifierRepository.findAll();
        return modifiers.stream().map(ModifierResponse::from).toList();
    }

    @Transactional
    public ModifierResponse create(ModifierRequest request) {
        ProductModifier modifier = ProductModifier.builder()
                .productId(request.getProductId())
                .name(request.getName())
                .priceAdjustment(request.getPriceAdjustment() != null ? request.getPriceAdjustment() : BigDecimal.ZERO)
                .modifierGroup(request.getModifierGroup())
                .active(request.getActive() == null || request.getActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return ModifierResponse.from(modifierRepository.save(modifier));
    }

    @Transactional
    public ModifierResponse update(Long id, ModifierRequest request) {
        ProductModifier modifier = findEntity(id);
        modifier.setProductId(request.getProductId());
        modifier.setName(request.getName());
        if (request.getPriceAdjustment() != null) {
            modifier.setPriceAdjustment(request.getPriceAdjustment());
        }
        modifier.setModifierGroup(request.getModifierGroup());
        if (request.getActive() != null) {
            modifier.setActive(request.getActive());
        }
        modifier.setUpdatedAt(LocalDateTime.now());
        return ModifierResponse.from(modifierRepository.save(modifier));
    }

    public ProductModifier findEntity(Long id) {
        return modifierRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Modifier not found"));
    }
}
