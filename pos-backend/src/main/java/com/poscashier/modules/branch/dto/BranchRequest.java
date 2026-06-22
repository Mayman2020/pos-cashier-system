package com.poscashier.modules.branch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BranchRequest {

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String address;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String email;

    private Boolean active;
}
