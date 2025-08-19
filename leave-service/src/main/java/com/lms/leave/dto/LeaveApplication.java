package com.lms.leave.dto;

import java.time.LocalDate;
import java.util.UUID;

public class LeaveApplication {
    private String id = UUID.randomUUID().toString();
    private String username;
    private String type;
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
    private String approverComment;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApproverComment() { return approverComment; }
    public void setApproverComment(String approverComment) { this.approverComment = approverComment; }
}
