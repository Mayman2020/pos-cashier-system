package com.poscashier.modules.user.dto;

import com.poscashier.modules.user.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private Long branchId;
    private List<String> roles;
    private boolean active;
    private boolean mustChangePassword;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .branchId(user.getBranchId())
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .active(user.isActive())
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }
}
