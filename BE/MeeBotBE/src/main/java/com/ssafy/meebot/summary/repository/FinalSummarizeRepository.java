package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.room.entity.Room;
import com.ssafy.meebot.summary.entity.FinalSummary;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface FinalSummarizeRepository extends JpaRepository<FinalSummary, Integer> {
    FinalSummary findByRoom_RoomCode(String roomCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FinalSummary f WHERE f.room = :room")
    Optional<FinalSummary> findByRoomForUpdate(@Param("room") Room room);
}
