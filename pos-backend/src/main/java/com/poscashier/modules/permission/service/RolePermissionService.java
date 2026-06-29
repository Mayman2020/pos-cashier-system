package com.poscashier.modules.permission.service;

import com.poscashier.modules.permission.dto.RolePermissionResponse;
import com.poscashier.modules.permission.dto.RolePermissionUpdateRequest;
import com.poscashier.modules.permission.entity.RolePermission;
import com.poscashier.modules.permission.repository.RolePermissionRepository;
import com.poscashier.modules.user.entity.Role;
import com.poscashier.modules.user.entity.User;
import com.poscashier.modules.user.repository.RoleRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final RoleRepository roleRepository;

    public List<RolePermissionResponse> getAll() {
        List<RolePermissionResponse> result = new ArrayList<>();
        for (Role role : roleRepository.findAll()) {
            result.add(toResponse(role));
        }
        return result;
    }

    public RolePermissionResponse getByRole(String roleName) {
        Role role = findRoleByName(roleName);
        return toResponse(role);
    }

    public RolePermissionResponse getMine(User user) {
        return RolePermissionResponse.builder()
                .role(user.getRoles().stream().findFirst().map(Role::getName).orElse("CASHIER"))
                .permissions(getPermissionMap(user))
                .build();
    }

    public Map<String, Map<String, Boolean>> getPermissionMap(User user) {
        return getPermissionMapForRoleIds(user.getRoles().stream().map(Role::getId).toList());
    }

    public Map<String, Map<String, Boolean>> getPermissionMap(Role role) {
        return getPermissionMapForRoleIds(List.of(role.getId()));
    }

    @Transactional
    public RolePermissionResponse update(String roleName, RolePermissionUpdateRequest request) {
        Role role = findRoleByName(roleName);
        for (Map.Entry<String, Map<String, Boolean>> entry : request.getPermissions().entrySet()) {
            RolePermission entity = rolePermissionRepository
                    .findByRoleIdAndModuleKey(role.getId(), entry.getKey())
                    .orElseGet(() -> RolePermission.builder().role(role).moduleKey(entry.getKey()).build());
            entity.setPermissions(new LinkedHashMap<>(entry.getValue()));
            rolePermissionRepository.save(entity);
        }
        return toResponse(role);
    }

    private Role findRoleByName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw AppException.badRequest("Role is required");
        }
        return roleRepository.findByName(roleName.trim().toUpperCase())
                .orElseThrow(() -> AppException.notFound("Role not found: " + roleName));
    }

    private RolePermissionResponse toResponse(Role role) {
        return RolePermissionResponse.builder()
                .roleId(role.getId())
                .role(role.getName())
                .permissions(getPermissionMap(role))
                .build();
    }

    private Map<String, Map<String, Boolean>> getPermissionMapForRoleIds(Collection<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return Map.of();
        }
        List<RolePermission> rows = rolePermissionRepository.findByRoleIdIn(roleIds);
        Map<String, Map<String, Boolean>> result = new LinkedHashMap<>();
        for (RolePermission row : rows) {
            Map<String, Boolean> modulePerms = result.computeIfAbsent(row.getModuleKey(), ignored -> new LinkedHashMap<>());
            mergeModulePermissions(modulePerms, row.getPermissions());
        }
        return result;
    }

    private void mergeModulePermissions(Map<String, Boolean> target, Map<String, Boolean> source) {
        if (source == null || source.isEmpty()) {
            return;
        }
        Set<String> keys = source.keySet();
        for (String key : keys) {
            boolean current = Boolean.TRUE.equals(target.get(key));
            boolean incoming = Boolean.TRUE.equals(source.get(key));
            target.put(key, current || incoming);
        }
    }
}
