package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.InterimSummary;
import com.ssafy.meebot.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterimSummarizeRepository extends JpaRepository<InterimSummary, Integer> {
    List<InterimSummary> findByRoomOrderByPresentationOrderAsc(Room room);
}
