package com.ssafy.meebot.participant.service;


import com.ssafy.meebot.participant.entity.Participant;
import com.ssafy.meebot.participant.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j  // 추가
public class ParticipantService {
    @Autowired
    private ParticipantRepository participantRepository;

    public void saveParticipants(String roomCode, List<String> userEmails) {
        log.info("Saving participants for room: {}", roomCode);
        userEmails.forEach(email -> {
            if (!participantRepository.existsByRoomCodeAndUserEmail(roomCode, email)) {
                Participant participant = Participant.builder()
                        .roomCode(roomCode)
                        .userEmail(email)
                        .build();
                participantRepository.save(participant);
                log.info("Saved participant. Room: {}, Email: {}", roomCode, email);
            } else {
                log.info("Participant already exists. Room: {}, Email: {}", roomCode, email);
            }
        });
    }
}