package com.ssafy.meebot.participant.repository;

import com.ssafy.meebot.participant.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Integer> {
    List<Participant> findByUserEmail(String email);
    List<Participant> findByRoomCode(String roomCode);

    boolean existsByRoomCodeAndUserEmail(String roomCode, String email);
}