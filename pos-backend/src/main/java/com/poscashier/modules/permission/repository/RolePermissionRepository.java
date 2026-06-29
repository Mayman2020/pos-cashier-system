package com.poscashier.modules.permission.repository;

import com.poscashier.modules.permission.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRoleId(Long roleId);

    List<RolePermission> findByRoleIdIn(Collection<Long> roleIds);

    Optional<RolePermission> findByRoleIdAndModuleKey(Long roleId, String moduleKey);
}
