package com.ssafy.meebot.user.controller;

import com.ssafy.meebot.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{userEmail}")
    public ResponseEntity<Map<String, String>> getUserInformation(@PathVariable String userEmail) {
        return ResponseEntity.ok(userService.getUserInformation(userEmail));
    }

    @PutMapping("/{userEmail}/nickname")
    public ResponseEntity<String> updateNickname(
            @PathVariable String userEmail,
            @RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        userService.updateNickname(userEmail, nickname);
        return ResponseEntity.ok("Nickname updated successfully");
    }
}