package com.ssafy.meebot.mystorage.controller;

import com.ssafy.meebot.common.security.CustomUserDetails;
import com.ssafy.meebot.mystorage.dto.MyStorageResponse;
import com.ssafy.meebot.mystorage.service.MyStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/storage")
@Slf4j
public class MyStorageController {

    private final MyStorageService myStorageService;

    @GetMapping
    public ResponseEntity<List<MyStorageResponse>> getMyStorageSummaries(@AuthenticationPrincipal CustomUserDetails userDetails) {

        List<MyStorageResponse> summaries = myStorageService.getSummariesByUserEmail(userDetails.getUsername());
        return ResponseEntity.ok(summaries);
    }

    @DeleteMapping("{roomCode}")
    public ResponseEntity<String> deleteFinalSummary(@PathVariable String roomCode,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            myStorageService.deleteStorageSummary(roomCode, userDetails.getUsername());
            return ResponseEntity.ok("해당 세션 요약본 삭제 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

}
