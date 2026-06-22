package com.poscashier.modules.supplier.service;

import com.poscashier.modules.supplier.dto.SupplierRequest;
import com.poscashier.modules.supplier.dto.SupplierResponse;
import com.poscashier.modules.supplier.entity.Supplier;
import com.poscashier.modules.supplier.repository.SupplierRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public Page<SupplierResponse> list(String q, Pageable pageable) {
        return supplierRepository.search(q, pageable).map(SupplierResponse::from);
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return SupplierResponse.from(findEntity(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        if (supplierRepository.findByCode(request.getCode()).isPresent()) {
            throw AppException.conflict("Supplier code already exists");
        }
        Supplier supplier = Supplier.builder()
                .code(request.getCode())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .active(request.getActive() == null || request.getActive())
                .build();
        return SupplierResponse.from(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findEntity(id);
        supplierRepository.findByCode(request.getCode())
                .filter(s -> !s.getId().equals(id))
                .ifPresent(s -> { throw AppException.conflict("Supplier code already exists"); });
        supplier.setCode(request.getCode());
        supplier.setName(request.getName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        if (request.getActive() != null) {
            supplier.setActive(request.getActive());
        }
        return SupplierResponse.from(supplierRepository.save(supplier));
    }

    @Transactional
    public void delete(Long id) {
        supplierRepository.delete(findEntity(id));
    }

    public Supplier findEntity(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Supplier not found"));
    }
}
