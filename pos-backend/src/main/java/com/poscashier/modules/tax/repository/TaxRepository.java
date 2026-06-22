package com.poscashier.modules.tax.repository;

import com.poscashier.modules.tax.entity.Tax;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaxRepository extends JpaRepository<Tax, Long> {

    Optional<Tax> findByCode(String code);

    List<Tax> findByActiveTrue();
}
