package com.poscashier.modules.table.service;

import com.poscashier.modules.table.dto.TableRequest;
import com.poscashier.modules.table.dto.TableResponse;
import com.poscashier.modules.table.entity.RestaurantTable;
import com.poscashier.modules.table.repository.RestaurantTableRepository;
import com.poscashier.shared.enums.TableStatus;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository tableRepository;

    @Transactional(readOnly = true)
    public List<TableResponse> list(Long branchId) {
        List<RestaurantTable> tables = branchId != null
                ? tableRepository.findByBranchId(branchId)
                : tableRepository.findAll();
        return tables.stream().map(TableResponse::from).toList();
    }

    @Transactional
    public TableResponse create(TableRequest request) {
        tableRepository.findByBranchIdAndTableNumber(request.getBranchId(), request.getTableNumber())
                .ifPresent(t -> { throw AppException.conflict("Table number already exists for branch"); });
        RestaurantTable table = RestaurantTable.builder()
                .branchId(request.getBranchId())
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 4)
                .status(request.getStatus() != null ? request.getStatus() : TableStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return TableResponse.from(tableRepository.save(table));
    }

    @Transactional
    public TableResponse update(Long id, TableRequest request) {
        RestaurantTable table = findEntity(id);
        tableRepository.findByBranchIdAndTableNumber(request.getBranchId(), request.getTableNumber())
                .filter(t -> !t.getId().equals(id))
                .ifPresent(t -> { throw AppException.conflict("Table number already exists for branch"); });
        table.setBranchId(request.getBranchId());
        table.setTableNumber(request.getTableNumber());
        if (request.getCapacity() != null) {
            table.setCapacity(request.getCapacity());
        }
        if (request.getStatus() != null) {
            table.setStatus(request.getStatus());
        }
        table.setUpdatedAt(LocalDateTime.now());
        return TableResponse.from(tableRepository.save(table));
    }

    public RestaurantTable findEntity(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Table not found"));
    }

    @Transactional
    public void setTableStatus(Long tableId, TableStatus status) {
        if (tableId == null) {
            return;
        }
        RestaurantTable table = findEntity(tableId);
        table.setStatus(status);
        table.setUpdatedAt(LocalDateTime.now());
        tableRepository.save(table);
    }
}
