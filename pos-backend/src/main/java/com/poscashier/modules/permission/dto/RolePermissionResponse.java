package com.poscashier.modules.permission.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class RolePermissionResponse {
    private Long roleId;
    private String role;
    private Map<String, Map<String, Boolean>> permissions;
}
