package com.poscashier.modules.customer.repository;

import com.poscashier.modules.customer.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    List<LoyaltyTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
