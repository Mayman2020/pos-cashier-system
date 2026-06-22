package com.poscashier.modules.customer.service;

import com.poscashier.modules.customer.dto.CustomerRequest;
import com.poscashier.modules.customer.dto.CustomerResponse;
import com.poscashier.modules.customer.entity.Customer;
import com.poscashier.modules.customer.repository.CustomerRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String q, Pageable pageable) {
        return customerRepository.search(q, pageable).map(CustomerResponse::from);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return CustomerResponse.from(findEntity(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = Customer.builder()
                .code(request.getCode())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .loyaltyPoints(request.getLoyaltyPoints() != null ? request.getLoyaltyPoints() : 0)
                .active(request.getActive() == null || request.getActive())
                .build();
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findEntity(id);
        customer.setCode(request.getCode());
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        if (request.getLoyaltyPoints() != null) {
            customer.setLoyaltyPoints(request.getLoyaltyPoints());
        }
        if (request.getActive() != null) {
            customer.setActive(request.getActive());
        }
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        customerRepository.delete(findEntity(id));
    }

    public Customer findEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Customer not found"));
    }
}
