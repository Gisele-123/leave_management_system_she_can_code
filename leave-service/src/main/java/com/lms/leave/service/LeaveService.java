package com.lms.leave.service;

import com.lms.leave.dto.ApplyLeaveRequest;
import com.lms.leave.dto.LeaveApplication;
import com.lms.leave.dto.LeaveBalanceResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final Map<String, Double> balances = new ConcurrentHashMap<>();
    private final Map<String, LeaveApplication> applications = new ConcurrentHashMap<>();

    public LeaveService() {
        // seed balances (20 days/year per requirement)
        balances.put("admin", 20.0);
        balances.put("staff", 20.0);
    }

    public LeaveBalanceResponse getBalance(String username) {
        return new LeaveBalanceResponse(username, balances.getOrDefault(username, 20.0));
    }

    public LeaveApplication apply(ApplyLeaveRequest req) {
        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        if (days <= 0) throw new IllegalArgumentException("Invalid date range");
        double bal = balances.getOrDefault(req.getUsername(), 20.0);
        if (bal < days) throw new IllegalArgumentException("Insufficient balance");
        var app = new LeaveApplication();
        app.setUsername(req.getUsername());
        app.setType(req.getType());
        app.setReason(req.getReason());
        app.setStartDate(req.getStartDate());
        app.setEndDate(req.getEndDate());
        applications.put(app.getId(), app);
        return app;
    }

    public LeaveApplication approve(String id, String status, String comment) {
        var app = applications.get(id);
        if (app == null) throw new NoSuchElementException("Application not found");
        app.setStatus(status);
        app.setApproverComment(comment);
        if ("APPROVED".equalsIgnoreCase(status)) {
            long days = ChronoUnit.DAYS.between(app.getStartDate(), app.getEndDate()) + 1;
            balances.put(app.getUsername(), Math.max(0, balances.getOrDefault(app.getUsername(), 20.0) - days));
            notifyUser(app.getUsername(), "Leave Approved", "Your leave (" + app.getId() + ") has been approved.");
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            notifyUser(app.getUsername(), "Leave Rejected", "Your leave (" + app.getId() + ") has been rejected.");
        }
        return app;
    }

    public List<LeaveApplication> currentlyOnLeave() {
        LocalDate today = LocalDate.now();
        return applications.values().stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> !today.isBefore(a.getStartDate()) && !today.isAfter(a.getEndDate()))
                .collect(Collectors.toList());
    }

    // CRUD helpers
    public List<LeaveApplication> listAll() { return applications.values().stream().toList(); }
    public List<LeaveApplication> listByUser(String username) {
        return applications.values().stream().filter(a -> a.getUsername().equalsIgnoreCase(username)).toList();
    }
    public LeaveApplication getById(String id) {
        var app = applications.get(id);
        if (app == null) throw new NoSuchElementException("Application not found");
        return app;
    }
    public LeaveApplication updateDates(String id, LocalDate start, LocalDate end, String reason) {
        var app = getById(id);
        if (!"PENDING".equalsIgnoreCase(app.getStatus())) throw new IllegalStateException("Only pending applications can be updated");
        app.setStartDate(start);
        app.setEndDate(end);
        app.setReason(reason);
        return app;
    }
    public void delete(String id) {
        var app = getById(id);
        if (!"PENDING".equalsIgnoreCase(app.getStatus())) throw new IllegalStateException("Only pending applications can be deleted");
        applications.remove(id);
    }

    private void notifyUser(String username, String subject, String body) {
        // For MVP: log-only email; in production, wire JavaMailSender and SMTP.
        System.out.println("[EMAIL_SIMULATION] to=" + username + "@example.com | subject=" + subject + " | body=" + body);
    }
}
