package com.poscashier.modules.customer.service;

import com.poscashier.modules.customer.dto.LoyaltyTransactionResponse;
import com.poscashier.modules.customer.entity.Customer;
import com.poscashier.modules.customer.entity.LoyaltyTransaction;
import com.poscashier.modules.customer.repository.CustomerRepository;
import com.poscashier.modules.customer.repository.LoyaltyTransactionRepository;
import com.poscashier.modules.settings.service.SettingsService;
import com.poscashier.shared.enums.LoyaltyTransactionType;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final CustomerRepository customerRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final SettingsService settingsService;

    @Transactional(readOnly = true)
    public int calculateEarnedPoints(BigDecimal orderTotal) {
        BigDecimal perPoint = settingsService.getDecimal("loyalty_points_per_currency", new BigDecimal("10"));
        if (perPoint.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return orderTotal.divide(perPoint, 0, RoundingMode.FLOOR).intValue();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateRedeemDiscount(int points) {
        BigDecimal valuePerPoint = settingsService.getDecimal("loyalty_redeem_value", new BigDecimal("0.5"));
        return valuePerPoint.multiply(BigDecimal.valueOf(points));
    }

    @Transactional
    public void earn(Long customerId, Long orderId, int points, String username) {
        if (customerId == null || points <= 0) {
            return;
        }
        Customer customer = findCustomer(customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        customerRepository.save(customer);
        record(customerId, orderId, LoyaltyTransactionType.EARN, points, "Points earned on order", username);
    }

    @Transactional
    public void redeem(Long customerId, Long orderId, int points, String username) {
        if (customerId == null || points <= 0) {
            return;
        }
        Customer customer = findCustomer(customerId);
        if (customer.getLoyaltyPoints() < points) {
            throw AppException.badRequest("Insufficient loyalty points");
        }
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - points);
        customerRepository.save(customer);
        record(customerId, orderId, LoyaltyTransactionType.REDEEM, -points, "Points redeemed on order", username);
    }

    @Transactional(readOnly = true)
    public List<LoyaltyTransactionResponse> listTransactions(Long customerId) {
        return loyaltyTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(LoyaltyTransactionResponse::from)
                .toList();
    }

    @Transactional
    public void reverseEarn(Long customerId, Long orderId, int points, String username) {
        if (customerId == null || points <= 0) {
            return;
        }
        adjustPoints(customerId, -points, "Reversal of earned points on refund", username);
    }

    @Transactional
    public void restoreRedeemed(Long customerId, Long orderId, int points, String username) {
        if (customerId == null || points <= 0) {
            return;
        }
        Customer customer = findCustomer(customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        customerRepository.save(customer);
        record(customerId, orderId, LoyaltyTransactionType.ADJUST, points,
                "Restored redeemed points on refund", username);
    }

    @Transactional
    public Customer adjustPoints(Long customerId, int points, String notes, String username) {
        Customer customer = findCustomer(customerId);
        int newBalance = customer.getLoyaltyPoints() + points;
        if (newBalance < 0) {
            throw AppException.badRequest("Insufficient loyalty points");
        }
        customer.setLoyaltyPoints(newBalance);
        customerRepository.save(customer);
        record(customerId, null, LoyaltyTransactionType.ADJUST, points, notes, username);
        return customer;
    }

    private void record(Long customerId, Long orderId, LoyaltyTransactionType type, int points, String notes, String username) {
        loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                .customerId(customerId)
                .orderId(orderId)
                .transactionType(type)
                .points(points)
                .notes(notes)
                .createdAt(LocalDateTime.now())
                .createdBy(username)
                .build());
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Customer not found"));
    }
}
