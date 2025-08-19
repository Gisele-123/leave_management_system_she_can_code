package com.lms.auth.service;

import com.lms.auth.dto.AuthRequest;
import com.lms.auth.dto.RegisterRequest;
import com.lms.auth.model.AppUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryUserService {
    private final Map<String, AppUser> users = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder;

    public InMemoryUserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        // Seed an admin
        var admin = new AppUser("admin", passwordEncoder.encode("admin123"), "admin@example.com", "ADMIN");
        users.put(admin.getUsername(), admin);
    }

    public AppUser register(RegisterRequest req) {
        if (users.containsKey(req.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        var user = new AppUser(req.getUsername(), passwordEncoder.encode(req.getPassword()), req.getEmail(), req.getRole());
        users.put(user.getUsername(), user);
        return user;
    }

    public AppUser authenticate(AuthRequest req) {
        var user = users.get(req.getUsername());
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return user;
    }
}
