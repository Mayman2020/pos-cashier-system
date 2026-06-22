package com.poscashier;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordHashTest {

    @Test
    void printBcryptForAdmin123() {
        String hash = new BCryptPasswordEncoder().encode("admin123");
        System.out.println("BCrypt hash for admin123: " + hash);
    }
}
