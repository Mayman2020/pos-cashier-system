package com.poscashier.modules.branch.repository;

import com.poscashier.modules.branch.entity.Branch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Long> {

    Optional<Branch> findByCode(String code);

    @Query("""
            SELECT b FROM Branch b
            WHERE (LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.code) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Branch> search(@Param("q") String q, Pageable pageable);
}
