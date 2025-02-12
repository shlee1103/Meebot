package com.ssafy.meebot.participant.controller;


import com.ssafy.meebot.participant.entity.Participant;
import com.ssafy.meebot.participant.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/participants")
@Slf4j  // 추가
public class ParticipantController {
    @Autowired
    private ParticipantService participantService;

    @PostMapping("/{roomCode}")
    public ResponseEntity<String> saveParticipants(
            @PathVariable String roomCode,
            @RequestBody List<String> userEmails) {
        log.info("Received request to save participants. Room: {}, Emails count: {}",
                roomCode, userEmails.size());
        participantService.saveParticipants(roomCode, userEmails);
        return ResponseEntity.ok("Participants saved successfully");
    }
}