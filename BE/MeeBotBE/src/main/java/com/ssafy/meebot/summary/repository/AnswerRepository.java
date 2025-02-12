package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Integer> {
}
