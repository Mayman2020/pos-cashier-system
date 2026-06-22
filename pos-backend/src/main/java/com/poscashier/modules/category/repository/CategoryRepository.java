package com.poscashier.modules.category.repository;

import com.poscashier.modules.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("""
            SELECT c FROM Category c
            WHERE (:q IS NULL OR :q = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY c.sortOrder ASC, c.name ASC
            """)
    Page<Category> search(@Param("q") String q, Pageable pageable);
}
