package com.poscashier.modules.product.service;

import com.poscashier.modules.product.dto.ProductVariantRequest;
import com.poscashier.modules.product.dto.ProductVariantResponse;
import com.poscashier.modules.product.entity.ProductVariant;
import com.poscashier.modules.product.repository.ProductVariantRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> listByProduct(Long productId) {
        productService.findEntity(productId);
        return variantRepository.findByProductIdOrderByNameAsc(productId).stream()
                .map(ProductVariantResponse::from).toList();
    }

    @Transactional
    public ProductVariantResponse create(Long productId, ProductVariantRequest request) {
        productService.findEntity(productId);
        if (variantRepository.findBySku(request.getSku()).isPresent()) {
            throw AppException.conflict("Variant SKU already exists");
        }
        ProductVariant variant = mapRequest(ProductVariant.builder().productId(productId).build(), request);
        variant.setCreatedAt(LocalDateTime.now());
        variant.setUpdatedAt(LocalDateTime.now());
        return ProductVariantResponse.from(variantRepository.save(variant));
    }

    @Transactional
    public ProductVariantResponse update(Long productId, Long variantId, ProductVariantRequest request) {
        ProductVariant variant = findForProduct(productId, variantId);
        variantRepository.findBySku(request.getSku())
                .filter(v -> !v.getId().equals(variantId))
                .ifPresent(v -> { throw AppException.conflict("Variant SKU already exists"); });
        mapRequest(variant, request);
        variant.setUpdatedAt(LocalDateTime.now());
        return ProductVariantResponse.from(variantRepository.save(variant));
    }

    @Transactional
    public void delete(Long productId, Long variantId) {
        variantRepository.delete(findForProduct(productId, variantId));
    }

    public ProductVariant findEntity(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> AppException.notFound("Product variant not found"));
    }

    private ProductVariant findForProduct(Long productId, Long variantId) {
        ProductVariant variant = findEntity(variantId);
        if (!variant.getProductId().equals(productId)) {
            throw AppException.notFound("Product variant not found");
        }
        return variant;
    }

    private ProductVariant mapRequest(ProductVariant variant, ProductVariantRequest request) {
        variant.setSku(request.getSku());
        variant.setBarcode(request.getBarcode());
        variant.setName(request.getName());
        variant.setCostPrice(request.getCostPrice());
        variant.setSellingPrice(request.getSellingPrice());
        if (request.getActive() != null) {
            variant.setActive(request.getActive());
        }
        return variant;
    }
}
