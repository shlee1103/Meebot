package com.ssafy.meebot.mystorage.repository;

import com.ssafy.meebot.summary.entity.FinalSummary;
import com.ssafy.meebot.mystorage.dto.MyStorageResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyStorageRepository extends JpaRepository<FinalSummary, Integer> {

    @Query("SELECT new com.ssafy.meebot.mystorage.dto.MyStorageResponse(r.roomCode, r.roomTitle, f.notionContent, f.pdfLink, r.createdAt) " +
            "FROM FinalSummary f " +
            "JOIN f.room r " +
            "WHERE r.roomCode IN (" +
            "  SELECT p.roomCode FROM Participant p WHERE p.userEmail = :userEmail AND p.deleted = 'ACTIVE'" +
            ")")
    List<MyStorageResponse> findSummariesByUserEmail(@Param("userEmail") String userEmail);

    @Modifying
    @Query("UPDATE Participant p SET p.deleted = 'DELETED' WHERE p.roomCode = :roomCode AND p.userEmail = :userEmail")
    void softDeleteByRoomCodeAndUserEmail(@Param("roomCode") String roomCode, @Param("userEmail") String userEmail);

    @Query("SELECT COUNT(p) > 0 FROM Participant p WHERE p.userEmail = :userEmail AND p.deleted = 'ACTIVE'")
    boolean existsByUserEmail(@Param("userEmail") String userEmail);

    @Query("SELECT COUNT(p) > 0 FROM Participant p WHERE p.roomCode = :roomCode AND p.userEmail = :userEmail AND p.deleted = 'ACTIVE'")
    boolean existsByRoomCodeAndUserEmail(@Param("roomCode") String roomCode, @Param("userEmail") String userEmail);
}
