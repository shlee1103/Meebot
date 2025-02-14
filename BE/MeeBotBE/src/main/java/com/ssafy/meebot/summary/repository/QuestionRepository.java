package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByRoom_RoomCodeOrderByPresentationOrder(String roomCode);
}
