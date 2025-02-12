package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Integer> {
}
