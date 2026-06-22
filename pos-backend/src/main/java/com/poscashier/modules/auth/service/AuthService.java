package com.poscashier.modules.auth.service;

import com.poscashier.modules.auth.dto.LoginRequest;
import com.poscashier.modules.auth.dto.LoginResponse;
import com.poscashier.modules.auth.dto.RefreshTokenRequest;
import com.poscashier.modules.user.entity.User;
import com.poscashier.modules.user.repository.UserRepository;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.security.JwtUtil;
import com.poscashier.shared.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final TokenBlacklistService tokenBlacklist;
    private final MessageSource messageSource;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw AppException.badRequest(msg("auth.error.credentials_required"));
        }
        String username = request.getUsername().trim();
        User resolved = userRepository.findByUsername(username)
                .or(() -> userRepository.findByUsernameIgnoreCase(username))
                .orElseThrow(() -> AppException.badRequest(msg("auth.error.invalid_password")));
        if (!resolved.isActive()) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(resolved.getUsername(), request.getPassword())
            );
            User user = (User) auth.getPrincipal();
            String clientIp = resolveClientIp(httpRequest);
            user.setLastLogin(LocalDateTime.now());
            user.setLastLoginIp(clientIp);
            userRepository.save(user);
            return buildResponse(user);
        } catch (DisabledException e) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        } catch (AuthenticationException e) {
            throw AppException.badRequest(msg("auth.error.invalid_password"));
        }
    }

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtUtil.isValid(token)) {
                Instant expiry = jwtUtil.extractExpiration(token).toInstant();
                tokenBlacklist.revoke(token, expiry);
            }
        }
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtUtil.isValid(token)) {
            throw AppException.badRequest(msg("auth.refresh.invalid"));
        }
        String username = jwtUtil.extractSubject(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        if (!user.isActive()) {
            throw AppException.badRequest(msg("auth.refresh.account_inactive"));
        }
        return buildResponse(user);
    }

    private LoginResponse buildResponse(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toList());
        Map<String, Object> claims = Map.of(
                "userId", user.getId(),
                "roles", roleNames,
                "branchId", user.getBranchId() != null ? user.getBranchId() : "",
                "mustChangePassword", user.isMustChangePassword()
        );
        String accessToken = jwtUtil.generateToken(user.getUsername(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .branchId(user.getBranchId())
                .roles(roleNames)
                .mustChangePassword(user.isMustChangePassword())
                .build();

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(userDto)
                .build();
    }

    private static String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }
}
