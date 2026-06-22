package com.poscashier.modules.branch.service;

import com.poscashier.modules.branch.dto.BranchRequest;
import com.poscashier.modules.branch.dto.BranchResponse;
import com.poscashier.modules.branch.entity.Branch;
import com.poscashier.modules.branch.repository.BranchRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public Page<BranchResponse> list(String q, Pageable pageable) {
        return branchRepository.search(q, pageable).map(BranchResponse::from);
    }

    @Transactional(readOnly = true)
    public BranchResponse getById(Long id) {
        return BranchResponse.from(findEntity(id));
    }

    @Transactional
    public BranchResponse create(BranchRequest request) {
        if (branchRepository.findByCode(request.getCode()).isPresent()) {
            throw AppException.conflict("Branch code already exists");
        }
        Branch branch = Branch.builder()
                .code(request.getCode())
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .active(request.getActive() == null || request.getActive())
                .build();
        return BranchResponse.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchResponse update(Long id, BranchRequest request) {
        Branch branch = findEntity(id);
        branchRepository.findByCode(request.getCode())
                .filter(b -> !b.getId().equals(id))
                .ifPresent(b -> { throw AppException.conflict("Branch code already exists"); });
        branch.setCode(request.getCode());
        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        if (request.getActive() != null) {
            branch.setActive(request.getActive());
        }
        return BranchResponse.from(branchRepository.save(branch));
    }

    @Transactional
    public void delete(Long id) {
        branchRepository.delete(findEntity(id));
    }

    public Branch findEntity(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Branch not found"));
    }
}
