package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.InterimSummary;
import com.ssafy.meebot.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterimSummarizeRepository extends JpaRepository<InterimSummary, Integer> {
    List<InterimSummary> findByRoomOrderByPresentationOrderAsc(Room room);
}
