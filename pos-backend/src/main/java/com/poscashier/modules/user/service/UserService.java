package com.poscashier.modules.user.service;

import com.poscashier.modules.user.dto.UserRequest;
import com.poscashier.modules.user.dto.UserResponse;
import com.poscashier.modules.user.entity.Role;
import com.poscashier.modules.user.entity.User;
import com.poscashier.modules.user.repository.RoleRepository;
import com.poscashier.modules.user.repository.UserRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(String q, Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findEntity(id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw AppException.conflict("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw AppException.conflict("Email already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(
                        request.getPassword() != null ? request.getPassword() : "changeme"))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .branchId(request.getBranchId())
                .roles(resolveRoles(request.getRoles()))
                .active(request.getActive() == null || request.getActive())
                .mustChangePassword(true)
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = findEntity(id);
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw AppException.conflict("Username already exists");
        }
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw AppException.conflict("Email already exists");
        }
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setBranchId(request.getBranchId());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRoles() != null) {
            user.setRoles(resolveRoles(request.getRoles()));
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        userRepository.delete(findEntity(id));
    }

    public User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        if (roleNames == null || roleNames.isEmpty()) {
            roleRepository.findByName("CASHIER").ifPresent(roles::add);
            return roles;
        }
        for (String name : roleNames) {
            Role role = roleRepository.findByName(name)
                    .orElseThrow(() -> AppException.badRequest("Role not found: " + name));
            roles.add(role);
        }
        return roles;
    }
}
