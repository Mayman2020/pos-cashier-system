package com.poscashier.modules.supplier.repository;

import com.poscashier.modules.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByCode(String code);

    @Query("""
            SELECT s FROM Supplier s
            WHERE (LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(s.code) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Supplier> search(@Param("q") String q, Pageable pageable);
}
