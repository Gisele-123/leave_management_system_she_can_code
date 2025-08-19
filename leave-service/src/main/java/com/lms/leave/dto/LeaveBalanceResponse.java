package com.lms.leave.dto;

public class LeaveBalanceResponse {
    private String username;
    private double remainingDays; // simple PTO balance for MVP

    public LeaveBalanceResponse() {}
    public LeaveBalanceResponse(String username, double remainingDays) {
        this.username = username;
        this.remainingDays = remainingDays;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public double getRemainingDays() { return remainingDays; }
    public void setRemainingDays(double remainingDays) { this.remainingDays = remainingDays; }
}
