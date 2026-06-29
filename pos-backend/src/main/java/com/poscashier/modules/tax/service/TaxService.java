package com.poscashier.modules.tax.service;

import com.poscashier.modules.tax.dto.TaxRequest;
import com.poscashier.modules.tax.dto.TaxResponse;
import com.poscashier.modules.tax.entity.Tax;
import com.poscashier.modules.tax.repository.TaxRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxService {

    private final TaxRepository taxRepository;

    @Transactional(readOnly = true)
    public List<TaxResponse> list() {
        return taxRepository.findAll().stream().map(TaxResponse::from).toList();
    }

    @Transactional
    public TaxResponse create(TaxRequest request) {
        if (taxRepository.findByCode(request.getCode()).isPresent()) {
            throw AppException.conflict("Tax code already exists");
        }
        if (Boolean.TRUE.equals(request.getDefaultTax())) {
            clearDefaultTax();
        }
        Tax tax = Tax.builder()
                .code(request.getCode())
                .name(request.getName())
                .rate(request.getRate())
                .defaultTax(Boolean.TRUE.equals(request.getDefaultTax()))
                .active(request.getActive() == null || request.getActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return TaxResponse.from(taxRepository.save(tax));
    }

    @Transactional
    public TaxResponse update(Long id, TaxRequest request) {
        Tax tax = findEntity(id);
        taxRepository.findByCode(request.getCode())
                .filter(t -> !t.getId().equals(id))
                .ifPresent(t -> { throw AppException.conflict("Tax code already exists"); });
        if (Boolean.TRUE.equals(request.getDefaultTax())) {
            clearDefaultTax();
        }
        tax.setCode(request.getCode());
        tax.setName(request.getName());
        tax.setRate(request.getRate());
        if (request.getDefaultTax() != null) {
            tax.setDefaultTax(request.getDefaultTax());
        }
        if (request.getActive() != null) {
            tax.setActive(request.getActive());
        }
        tax.setUpdatedAt(LocalDateTime.now());
        return TaxResponse.from(taxRepository.save(tax));
    }

    public Tax findEntity(Long id) {
        return taxRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Tax not found"));
    }

    @Transactional
    public void delete(Long id) {
        Tax tax = findEntity(id);
        tax.setActive(false);
        tax.setUpdatedAt(LocalDateTime.now());
        taxRepository.save(tax);
    }

    private void clearDefaultTax() {
        taxRepository.findAll().forEach(t -> {
            if (t.isDefaultTax()) {
                t.setDefaultTax(false);
                t.setUpdatedAt(LocalDateTime.now());
                taxRepository.save(t);
            }
        });
    }
}
