package com.ssafy.meebot.room.repository;

import com.ssafy.meebot.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    @Query("SELECT r FROM Room r WHERE r.roomCode IN (SELECT p.roomCode FROM Participant p WHERE p.userEmail = :email)")
    List<Room> findRoomsByUserEmail(@Param("email") String email);

    Room findByRoomCode(String roomCode);

}
