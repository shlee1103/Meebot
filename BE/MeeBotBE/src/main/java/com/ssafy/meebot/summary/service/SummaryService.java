package com.ssafy.meebot.summary.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.meebot.summary.repository.FinalSummarizeRepository;
import com.ssafy.meebot.summary.entity.Answer;
import com.ssafy.meebot.summary.entity.FinalSummary;
import com.ssafy.meebot.summary.entity.InterimSummary;
import com.ssafy.meebot.summary.entity.Question;
import com.ssafy.meebot.summary.repository.InterimSummarizeRepository;
import com.ssafy.meebot.room.entity.Room;
import com.ssafy.meebot.room.repository.RoomRepository;
import com.ssafy.meebot.summary.repository.AnswerRepository;
import com.ssafy.meebot.summary.repository.QuestionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static reactor.core.publisher.Mono.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SummaryService {

    @Value("${openai.model}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final InterimSummarizeRepository interimSummarizeRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final RoomRepository roomRepository;
    private final FinalSummarizeRepository finalSummarizeRepository;

    /**
     * 발표 팀 수, 발표 시간, 질의응답 시간 줘야함
     */
    public Mono<String> startSession(Map<String, Object> request) {
        Integer presentationTeamsNum = (Integer) request.get("presentation_teams_num");
        Integer presentationTime = (Integer) request.get("presentation_time");
        Integer questionTime = (Integer) request.get("question_time");
        List<String> presenters = (List<String>) request.get("presenters");

        StringBuilder query = new StringBuilder();
        query.append("발표를 시작합니다. 총 ").append(presentationTeamsNum).append("개의 팀이 발표하고 한 팀당 ")
                .append(presentationTime).append("분 동안 발표를 진행합니다. 질문 시간은 ")
                .append(questionTime).append("분 이고 발표 순서는").append(presenters)
                .append(questionTime).append("순 입니다.\n\n");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. 발표 흐름을 안내하는 역할을 해줘. " +
                                        "발표 주제, 발표자 순서를 먼저 말하고 그 다음으로" +
                                        "첫 번째 발표자에게 화면 공유를 켜고, 공유가 완료되면 관리자는 발표 시작 버튼을 눌러달라고 해줘." +
                                        " 답변은 이모티콘 없이 텍스트로만 해줘."),
                        Map.of("role", "user", "content", query.toString())
                ),
                "temperature", 0.5
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "OpenAI 응답 실패";
                });
    }

    public Mono<String> nextSession(Map<String, Object> request) {
        Map<String, Object> presenter = (Map<String, Object>) request.get("presenter");

        StringBuilder query = new StringBuilder();

        query.append("현재 발표자는 ")
                .append(presenter.get("presenter")).append("님 입니다. (")
                .append(presenter.get("presentaiton_order")).append("번째 발표)");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. 이전 발표자의 발표가 끝나고, 다음과 같이 현재 발표자가 발표를 시작할거야." +
                                        "이를 안내해줘. 친근하고 활기찬 톤으로 발표자를 응원하고 격려하는 멘트를 포함해줘. 답변은 이모티콘 없이 텍스트로만 해줘."),
                        Map.of("role", "user", "content", query.toString())
                ),
                "temperature", 0.5
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "OpenAI 응답 실패";
                });
    }



    public Mono<ResponseEntity<Map<String, Object>>> generateSummaryAndQuestions(Map<String, Object> request) {
        String presenter = (String) request.get("presenter");
        String transcripts = (String) request.get("transcripts");
        String roomCode = (String) request.get("roomCode");
        Integer presentationOrder = (Integer) request.get("presentation_order");

        Room room = roomRepository.findByRoomCode(roomCode);

        if (room == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Room not found",
                            "message", "해당 세션 이름의 방을 찾을 수 없습니다! : " + roomCode
                    )));
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행 사회자 역할을 맡고 있어. 전달받은 발표 내용을 요약하고, 발표 내용에 기반하여 5개의 질문을 생성해야 해. " +
                                        "요약과 질문은 \\n\\n\\n 을 기준으로 구분해 줘. 활기차고 발랄하고 귀엽게 대답해줘!\n\n" +
                                        "요약은 간략하고 핵심만 포함해야 하며, 질문은 번호를 붙인 하나의 String으로 구성해야 해. 형식은 다음과 같아:\n\n" +
                                        "{\n  \"text\": \"간단한 요약 내용\",\n  \"question\": \"1. 질문 1\\n2. 질문 2\\n3. 질문 3\\n4. 질문 4\\n5. 질문 5\",\n  \"presenter\": \"발표자 이름\"\n}"),
                        Map.of("role", "user", "content",
                                String.format("발표자: %s\n발표 내용: %s", presenter, transcripts))
                ),
                "temperature", 0.6
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        String assistantContent = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

                        try {
                            Map<String, Object> contentMap = objectMapper.readValue(assistantContent, Map.class);

                            InterimSummary summary = InterimSummary.builder()
                                    .room(Room.builder().roomCode(roomCode).build())
                                    .presenter(presenter)
                                    .content(objectMapper.writeValueAsString(contentMap))
                                    .presentationOrder(presentationOrder)
                                    .build();

                            interimSummarizeRepository.save(summary);

                            Map<String, Object> successResponse = Map.of(
                                    "summation", contentMap
                            );

                            return ResponseEntity.ok(successResponse);
                        } catch (Exception e) {
                            log.error("Error saving summary to DB: ", e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body(Map.of(
                                            "error", "DB 저장 오류",
                                            "message", "DB 저장 중 오류가 발생했습니다."
                                    ));
                        }
                    }

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                            "error", "Invalid Data",
                            "message", "데이터가 유효하지 않습니다."
                    ));
                });
    }


    private List<InterimSummary> getSummariesByRoomCode(String roomCode) {
        return interimSummarizeRepository.findByRoomOrderByPresentationOrderAsc(Room.builder().roomCode(roomCode).build());
    }

    public Mono<ResponseEntity<Map<String, Object>>> finalSummarize(Map<String, Object> request) {
        String roomCode = (String) request.get("roomCode");
        Room room = roomRepository.findByRoomCode(roomCode);

        if (room == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Room not found",
                            "message", "해당 세션 이름의 방을 찾을 수 없습니다!: " + roomCode
                    )));
        }

        List<InterimSummary> summaries = getSummariesByRoomCode(roomCode);
        if (summaries.isEmpty()) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "No summaries found",
                            "message", "해당 세션 이름으로 요약된 정보가 없습니다!: " + roomCode
                    )));
        }

        StringBuilder query = new StringBuilder();
        for (InterimSummary summary : summaries) {
            String presenter = summary.getPresenter();
            String content = summary.getContent();
            query.append("발표자: ").append(presenter).append("\n");
            query.append(content).append("\n");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행 사회자 역할을 맡고 있어. 지금 발표회가 종료되었고 오늘 발표회에서 진행했던 모든 내용들을 요약해줘. 반환할 형식은 다음과 같아:\n" +
                                        "{\n  \"topic\": \"오늘 발표회의 주제(요약해서)\",\n  \"presenters\": \"오늘 발표한 사람들 (발표순서대로)\",\n  \"summary\": \"오늘 발표 내용 요약\"\n}"),
                        Map.of("role", "user", "content", query.toString())
                ),
                "temperature", 0.6
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        String assistantContent = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

                        try {
                            Map<String, Object> contentMap = objectMapper.readValue(assistantContent, Map.class);

                            FinalSummary finalSummary = new FinalSummary();
                            finalSummary.setRoom(room);
                            finalSummary.setContent(objectMapper.writeValueAsString(contentMap));
                            finalSummarizeRepository.save(finalSummary);

                            Map<String, Object> successResponse = Map.of(
                                    "summation", contentMap
                            );

                            return ResponseEntity.ok(successResponse);
                        } catch (JsonProcessingException e) {
                            log.error("Error parsing GPT response: ", e);
                            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body(Map.of(
                                            "error", "JSON 파싱 오류",
                                            "message", "JSON 파싱 중 오류가 발생했습니다."
                                    ));
                        }
                    }

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "error", "Invalid Data",
                                    "message", "GPT 응답을 처리할 수 없습니다."
                            ));
                });
    }


    @Transactional
    public Mono<ResponseEntity<Map<String, String>>> saveQna(Map<String, Object> request) {
        String roomCode = (String) request.get("roomCode");
        Integer presentationOrder = (Integer) request.get("presentation_order");
        String script = (String) request.get("script");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "이 스크립트에서 질문과 대답을 구분해줘 질문과 대답의 개수는 최대 3개 정도야." +
                                        "형식은 다음과 같아:\n\n" +
                                        "{\n" +
                                        "  \"qna_list\": [\n" +
                                        "    {\n" +
                                        "      \"question\": \"질문1\",\n" +
                                        "      \"answer\": \"답변1\"\n" +
                                        "    },\n" +
                                        "    {\n" +
                                        "      \"question\": \"질문2\",\n" +
                                        "      \"answer\": \"답변2\"\n" +
                                        "    }\n" +
                                        "  ]\n" +
                                        "}\n\n"),
                        Map.of("role", "user", "content",
                                String.format("질의응답 내용 %s", script))
                ),
                "temperature", 0.6
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        String assistantContent = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

                        try {
                            return objectMapper.readValue(assistantContent, Map.class);
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException("JSON 파싱 오류", e);
                        }
                    }
                    return new HashMap<String, Object>();
                })
                .flatMap(result -> saveQnaPairs(result, roomCode, presentationOrder)
                        .thenReturn(ResponseEntity.ok(Map.of(
                                "status", "success",
                                "message", "QnA가 저장되었습니다."
                        ))))
                .onErrorResume(e -> handleError((Throwable) e));
    }

    private Mono<ResponseEntity<Map<String, String>>> handleError(Throwable e) {
        Map<String, String> errorResponse = new HashMap<>();
        HttpStatus status;

        if (e instanceof DataIntegrityViolationException) {
            errorResponse.put("error", "데이터 무결성 오류");
            errorResponse.put("message", "질의응답 데이터 처리 중 오류가 발생했습니다.");
            status = HttpStatus.BAD_REQUEST;
        } else if (e instanceof JsonProcessingException) {
            errorResponse.put("error", "JSON 파싱 오류");
            errorResponse.put("message", "GPT 응답을 처리하는 중 오류가 발생했습니다.");
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            errorResponse.put("error", "서버 내부 오류");
            errorResponse.put("message", "DB 저장 중 오류가 발생했습니다.");
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return Mono.just(ResponseEntity.status(status).body(errorResponse));
    }

    private Mono<ResponseEntity<Map<String, String>>> saveQnaPairs(Map<String, Object> result, String roomCode, Integer presentationOrder) {
        List<Map<String, Object>> qnaList = (List<Map<String, Object>>) result.get("qna_list");

        return defer(() -> {
            for (Map<String, Object> qna : qnaList) {
                try {
                    Room room = roomRepository.findByRoomCode(roomCode);

                    if (room == null) {
                        throw new IllegalArgumentException("해당 세션 이름의 방을 찾을 수 없습니다!: " + roomCode);
                    }

                    Question question = new Question();
                    question.setRoom(room);
                    question.setContent((String) qna.get("question"));
                    question.setQuestionOrder(presentationOrder);
                    Question savedQuestion = questionRepository.save(question);

                    Answer answer = new Answer();
                    answer.setQuestion(savedQuestion);
                    answer.setContent((String) qna.get("answer"));
                    Answer saved = answerRepository.save(answer);
                    log.info("DB 저장 성공: {}", saved);
                } catch (Exception e) {
                    log.error("Error saving Q&A: ", e);
                    throw new RuntimeException("DB 저장 중 오류가 발생했습니다.", e);
                }
            }
            return empty();
        });
    }

    public Mono<String> generateEndingMessage(Map<String, Object> request) {
        String roomTitle = (String) request.get("roomTitle");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. " +
                                        "발표회가 모두 끝났어. 발표회를 마무리하는 감동적이고 마음을 울릴만한 멘트를 해줘. " +
                                        "발표자들을 응원하고 격려하는 내용을 포함해줘. 안녕하세요는 빼주면 좋겠어. 3~4줄 정도로 말해줘."),
                        Map.of("role", "user", "content",
                                String.format("'%s' 발표회를 마무리하는 멘트를 해줘.", roomTitle))
                ),
                "temperature", 0.7
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "발표회를 마무리합니다. 모든 발표자분들 수고하셨습니다.";
                });
    }

}



