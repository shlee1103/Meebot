package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.FinalSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface FinalSummarizeRepository extends JpaRepository<FinalSummary, Integer> {
    FinalSummary findByRoom_RoomCode(String roomCode);
}
