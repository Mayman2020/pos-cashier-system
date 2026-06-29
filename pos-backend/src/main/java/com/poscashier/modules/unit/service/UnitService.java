package com.poscashier.modules.unit.service;

import com.poscashier.modules.unit.dto.UnitRequest;
import com.poscashier.modules.unit.dto.UnitResponse;
import com.poscashier.modules.unit.entity.Unit;
import com.poscashier.modules.unit.repository.UnitRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    @Transactional(readOnly = true)
    public Page<UnitResponse> list(String q, Pageable pageable) {
        String query = q == null ? null : q.trim();
        if (query == null || query.isEmpty()) {
            return unitRepository.findAll(pageable).map(UnitResponse::from);
        }
        return unitRepository.search(query, pageable).map(UnitResponse::from);
    }

    @Transactional(readOnly = true)
    public UnitResponse getById(Long id) {
        return UnitResponse.from(findEntity(id));
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        if (unitRepository.findByCode(request.getCode()).isPresent()) {
            throw AppException.conflict("Unit code already exists");
        }
        Unit unit = Unit.builder()
                .code(request.getCode())
                .name(request.getName())
                .symbol(request.getSymbol())
                .build();
        return UnitResponse.from(unitRepository.save(unit));
    }

    @Transactional
    public UnitResponse update(Long id, UnitRequest request) {
        Unit unit = findEntity(id);
        unitRepository.findByCode(request.getCode())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> { throw AppException.conflict("Unit code already exists"); });
        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setSymbol(request.getSymbol());
        return UnitResponse.from(unitRepository.save(unit));
    }

    @Transactional
    public void delete(Long id) {
        unitRepository.delete(findEntity(id));
    }

    public Unit findEntity(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Unit not found"));
    }
}
