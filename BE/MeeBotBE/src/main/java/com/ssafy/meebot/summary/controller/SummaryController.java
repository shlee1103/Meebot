package com.ssafy.meebot.summary.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.meebot.summary.service.SummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/chatgpt")
public class SummaryController {

    private final SummaryService summaryService;

    @PostMapping("/start-presentation")
    public Mono<Map<String, String>> startPresentation(@RequestBody Map<String, Object> request) {
        return summaryService.startSession(request)
                .map(response -> Map.of("message", response));
    }

    @PostMapping("/next-presentation")
    public Mono<Map<String, String>> nextPresentation(@RequestBody Map<String, Object> request) {
        return summaryService.nextSession(request)
                .map(response -> Map.of("message", response));
    }

    @PostMapping("/interim-summarize")
    public Mono<ResponseEntity<Map<String, Object>>> interimSummarize(@RequestBody Map<String, Object> request) {
        return summaryService.generateSummaryAndQuestions(request);
    }


    @PostMapping("/final-summarize")
    public Mono<ResponseEntity<Map<String, Object>>> finalSummarize(@RequestBody Map<String, Object> request) throws JsonProcessingException {
        return summaryService.finalSummarize(request);
    }

    @PostMapping("/qna")
    public Mono<ResponseEntity<Map<String, String>>> makeQna(@RequestBody Map<String, Object> request) {
        return summaryService.saveQna(request);
    }

}
