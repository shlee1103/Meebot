package com.ssafy.meebot.room.service;

import com.ssafy.meebot.participant.repository.ParticipantRepository;
import com.ssafy.meebot.room.entity.Room;
import com.ssafy.meebot.room.repository.RoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


@Service
@Transactional
@Slf4j
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ParticipantRepository participantRepository;

    public void updateTitle(String roomCode, String roomTitle) {
        Room room = roomRepository.findById(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setRoomTitle(roomTitle);
        roomRepository.save(room);
    }


    public Room createRoom(Room room) {
        room.setCreatedAt(LocalDateTime.now());
        return roomRepository.save(room);
    }

    // 방 호스트 변경
    public void updateHostEmail(String roomCode, String hostEmail) {
        Room room = roomRepository.findById(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setHostEmail(hostEmail);
        roomRepository.save(room);
    }


    public List<Room> getMyRooms(String userEmail) {
        log.info("Fetching rooms for user: {}", userEmail);
        List<Room> rooms = roomRepository.findRoomsByUserEmail(userEmail);
        log.info("Found {} rooms", rooms.size());
        return rooms;
    }

}
