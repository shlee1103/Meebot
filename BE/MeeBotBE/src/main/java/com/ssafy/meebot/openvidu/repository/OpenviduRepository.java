package com.ssafy.meebot.openvidu.repository;

import com.ssafy.meebot.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OpenviduRepository extends JpaRepository<Room, String> {
    Optional<Room> findByroomCode(String sessionId);
}

