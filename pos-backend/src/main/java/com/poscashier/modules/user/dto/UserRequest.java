package com.poscashier.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UserRequest {

    @NotBlank
    @Size(max = 100)
    private String username;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 150)
    private String fullName;

    @Size(max = 30)
    private String phone;

    private Long branchId;

    private Set<String> roles;

    private Boolean active;
}
