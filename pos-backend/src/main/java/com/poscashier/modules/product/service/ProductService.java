package com.poscashier.modules.product.service;

import com.poscashier.modules.product.dto.ProductRequest;
import com.poscashier.modules.product.dto.ProductResponse;
import com.poscashier.modules.product.entity.Product;
import com.poscashier.modules.product.repository.ProductRepository;
import com.poscashier.modules.tax.repository.TaxRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final TaxRepository taxRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(String q, Pageable pageable) {
        String query = q == null ? null : q.trim();
        if (query == null || query.isEmpty()) {
            return productRepository.findAll(pageable).map(ProductResponse::from);
        }
        return productRepository.search(query, pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findEntity(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw AppException.conflict("Product SKU already exists");
        }
        Product product = mapRequest(new Product(), request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);
        productRepository.findBySku(request.getSku())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw AppException.conflict("Product SKU already exists"); });
        mapRequest(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        productRepository.delete(findEntity(id));
    }

    public Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Product not found"));
    }

    private Product mapRequest(Product product, ProductRequest request) {
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());
        product.setUnitId(request.getUnitId());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getTaxId() != null) {
            product.setTaxId(request.getTaxId());
            taxRepository.findById(request.getTaxId()).ifPresent(t -> product.setTaxRate(t.getRate()));
        } else if (request.getTaxRate() != null) {
            product.setTaxRate(request.getTaxRate());
        } else if (product.getTaxRate() == null) {
            product.setTaxRate(BigDecimal.ZERO);
        }
        if (request.getTrackStock() != null) {
            product.setTrackStock(request.getTrackStock());
        }
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        product.setImageUrl(request.getImageUrl());
        return product;
    }
}
