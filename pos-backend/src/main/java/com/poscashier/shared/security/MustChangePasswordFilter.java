package com.poscashier.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MustChangePasswordFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    private static final List<String> ALLOWED_PATH_PREFIXES = List.of(
            "/auth/",
            "/users/me",
            "/users/me/change-password"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!user.isMustChangePassword()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        boolean allowed = ALLOWED_PATH_PREFIXES.stream().anyMatch(path::startsWith);
        if (allowed) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        ApiResponse<Void> body = ApiResponse.error(
                "You must change your temporary password before continuing.",
                "PASSWORD_CHANGE_REQUIRED"
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
