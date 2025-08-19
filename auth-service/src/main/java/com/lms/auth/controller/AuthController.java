package com.lms.auth.controller;

import com.lms.auth.dto.AuthRequest;
import com.lms.auth.dto.AuthResponse;
import com.lms.auth.dto.GoogleTokenRequest;
import com.lms.auth.dto.RegisterRequest;
import com.lms.auth.security.JwtService;
import com.lms.auth.service.GoogleVerifierService;
import com.lms.auth.service.InMemoryUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final InMemoryUserService userService;
    private final JwtService jwtService;
    private final GoogleVerifierService googleVerifierService;

    public AuthController(InMemoryUserService userService, JwtService jwtService, GoogleVerifierService googleVerifierService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.googleVerifierService = googleVerifierService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        var user = userService.register(request);
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        var user = userService.authenticate(request);
        // 2FA stub handling: if request has totp, we would verify here; skipped for MVP
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleTokenRequest request) {
        var payload = googleVerifierService.verify(request.getIdToken());
        if (payload == null) {
            return ResponseEntity.badRequest().build();
        }
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        var user = userService.findOrCreateGoogleUser(email, name);
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
