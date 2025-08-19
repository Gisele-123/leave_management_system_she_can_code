package com.lms.leave.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ApplyLeaveRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String type; // PTO, SICK, COMPASSIONATE, MATERNITY, OTHER
    private String reason;
    @NotNull @FutureOrPresent
    private LocalDate startDate;
    @NotNull @FutureOrPresent
    private LocalDate endDate;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
