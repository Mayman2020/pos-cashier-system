package com.poscashier.modules.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRequest {

    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String email;

    @Size(max = 500)
    private String address;

    private Integer loyaltyPoints;

    private Boolean active;
}
