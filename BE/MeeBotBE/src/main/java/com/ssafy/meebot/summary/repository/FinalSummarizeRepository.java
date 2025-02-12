package com.ssafy.meebot.summary.repository;

import com.ssafy.meebot.summary.entity.FinalSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinalSummarizeRepository extends JpaRepository<FinalSummary, Integer> {
}
