package com.lms.leave.controller;

import com.lms.leave.dto.ApplyLeaveRequest;
import com.lms.leave.dto.LeaveApplication;
import com.lms.leave.dto.LeaveBalanceResponse;
import com.lms.leave.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/leaves")
public class LeaveController {
    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping("/balance/{username}")
    public LeaveBalanceResponse getBalance(@PathVariable String username) {
        return leaveService.getBalance(username);
    }

    @PostMapping("/apply")
    public LeaveApplication apply(@Valid @RequestBody ApplyLeaveRequest request) {
        return leaveService.apply(request);
    }

    @PostMapping("/approve/{id}")
    public LeaveApplication approve(@PathVariable String id, @RequestParam(defaultValue = "APPROVED") String status, @RequestParam(required = false) String comment) {
        return leaveService.approve(id, status, comment);
    }

    @GetMapping("/currently-on-leave")
    public List<LeaveApplication> currentlyOnLeave() {
        return leaveService.currentlyOnLeave();
    }

    // CRUD endpoints
    @GetMapping
    public List<LeaveApplication> listAll() { return leaveService.listAll(); }

    @GetMapping("/user/{username}")
    public List<LeaveApplication> listByUser(@PathVariable String username) { return leaveService.listByUser(username); }

    @GetMapping("/{id}")
    public LeaveApplication getById(@PathVariable String id) { return leaveService.getById(id); }

    @PutMapping("/{id}")
    public LeaveApplication update(@PathVariable String id, @RequestParam LocalDate startDate, @RequestParam LocalDate endDate, @RequestParam(required = false) String reason) {
        return leaveService.updateDates(id, startDate, endDate, reason);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { leaveService.delete(id); }
}
