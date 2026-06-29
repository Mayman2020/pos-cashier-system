package com.poscashier.modules.permission.service;

import com.poscashier.modules.user.entity.Role;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PermissionEvaluatorService {

    private final RolePermissionService rolePermissionService;

    public void assertCan(String module, String action) {
        User user = SecurityUtils.getCurrentUser();
        boolean admin = user.getRoles().stream().map(Role::getName).anyMatch("ADMIN"::equalsIgnoreCase);
        if (admin) {
            return;
        }
        Map<String, Map<String, Boolean>> permissions = rolePermissionService.getPermissionMap(user);
        Map<String, Boolean> modulePerms = permissions.get(module);
        if (modulePerms == null || !Boolean.TRUE.equals(modulePerms.get(action))) {
            throw AppException.forbidden("Access denied: action '" + action + "' on module '" + module + "' is not allowed");
        }
    }

    public boolean can(String module, String action) {
        try {
            assertCan(module, action);
            return true;
        } catch (AppException ex) {
            return false;
        }
    }
}
