package com.poscashier.modules.discount.service;

import com.poscashier.modules.discount.dto.DiscountRequest;
import com.poscashier.modules.discount.dto.DiscountResponse;
import com.poscashier.modules.discount.entity.Discount;
import com.poscashier.modules.discount.repository.DiscountRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    @Transactional(readOnly = true)
    public List<DiscountResponse> list() {
        return discountRepository.findAll().stream().map(DiscountResponse::from).toList();
    }

    @Transactional
    public DiscountResponse create(DiscountRequest request) {
        if (discountRepository.findByCode(request.getCode()).isPresent()) {
            throw AppException.conflict("Discount code already exists");
        }
        Discount discount = Discount.builder()
                .code(request.getCode())
                .name(request.getName())
                .discountType(request.getDiscountType())
                .value(request.getValue())
                .active(request.getActive() == null || request.getActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return DiscountResponse.from(discountRepository.save(discount));
    }

    @Transactional
    public DiscountResponse update(Long id, DiscountRequest request) {
        Discount discount = findEntity(id);
        discountRepository.findByCode(request.getCode())
                .filter(d -> !d.getId().equals(id))
                .ifPresent(d -> { throw AppException.conflict("Discount code already exists"); });
        discount.setCode(request.getCode());
        discount.setName(request.getName());
        discount.setDiscountType(request.getDiscountType());
        discount.setValue(request.getValue());
        if (request.getActive() != null) {
            discount.setActive(request.getActive());
        }
        discount.setUpdatedAt(LocalDateTime.now());
        return DiscountResponse.from(discountRepository.save(discount));
    }

    public Discount findEntity(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Discount not found"));
    }
}
