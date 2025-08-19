package com.lms.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;

    private String totp; // optional 2FA code (stub)

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTotp() { return totp; }
    public void setTotp(String totp) { this.totp = totp; }
}
