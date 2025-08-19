package com.lms.leave.controller;

import com.lms.leave.dto.ApplyLeaveRequest;
import com.lms.leave.dto.LeaveApplication;
import com.lms.leave.dto.LeaveBalanceResponse;
import com.lms.leave.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
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
}
