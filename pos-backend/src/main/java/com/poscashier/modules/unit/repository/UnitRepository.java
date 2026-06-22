package com.poscashier.modules.unit.repository;

import com.poscashier.modules.unit.entity.Unit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    Optional<Unit> findByCode(String code);

    @Query("""
            SELECT u FROM Unit u
            WHERE (:q IS NULL OR :q = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.code) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Unit> search(@Param("q") String q, Pageable pageable);
}
