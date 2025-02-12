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
import com.fasterxml.jackson.databind.JsonNode;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

    public List<Question> getQuestionsByRoomCode(String roomCode) {
        return questionRepository.findByRoom_RoomCodeOrderByPresentationOrder(roomCode);
    }

    /**
     * 발표 팀 수, 발표 시간, 질의응답 시간 줘야함
     */
    public Mono<String> startSession(Map<String, Object> request) {
        Integer presentationTeamsNum = (Integer) request.get("presentation_teams_num");
        Integer presentationTime = (Integer) request.get("presentation_time");
        Integer questionTime = (Integer) request.get("question_time");

        StringBuilder query = new StringBuilder();
        query.append("발표를 시작합니다. 총 ").append(presentationTeamsNum).append("개의 팀이 발표하고 한 팀당 ")
                .append(presentationTime).append("분 동안 발표를 진행합니다. 질문 시간은 ").append(questionTime).append("분 입니다.\n\n");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. 발표 흐름을 안내하는 역할을 해줘. " +
                                        "친근하고 활기찬 톤으로 발표자를 응원하고 격려하는 멘트를 포함해줘. 답변은 이모티콘 없이 텍스트로만 해줘."),
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
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. 이전 발표자의 발표가 끝나고, 다음과 같이 현재 발표자가 발표를 시작할거야. 화면 공유를 시작해 달라는 말과 함께" +
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

    public Mono<ResponseEntity<Map<String, Object>>> finalSummarize(Map<String, Object> request) throws JsonProcessingException {
        String roomCode = (String) request.get("roomCode");
        Room room = roomRepository.findByRoomCode(roomCode);
        // order(발표 순서) 기준으로 question 불러옴 -> question_id 순으로 final script에 저장
        List<Question> questions = getQuestionsByRoomCode(roomCode);

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

        // JSON 데이터 생성
        List<Map<String, Object>> jsonData = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        // 방 제목 저장
        jsonData.add(Map.of("room_title", room.getRoomTitle()));
        jsonData.add(Map.of("date", room.getCreatedAt().format(formatter)));
        for (InterimSummary summary : summaries) {
            String presenter = summary.getPresenter();
            String content = summary.getContent();
            ObjectMapper objectMapper = new ObjectMapper();

            // JSON 문자열을 JsonNode로 변환
            JsonNode rootNode = objectMapper.readTree(content);
            String summaryContent = rootNode.get("summary").asText();

            // 발표 순서와 동일한 질문 찾기
            int presentationOrder = summary.getPresentationOrder();
            List<Question> filteredQuestions = questions.stream()
                    .filter(q -> q.getPresentationOrder() != null && q.getPresentationOrder()==presentationOrder)
                    .toList();

            for(Question q: filteredQuestions){
                System.out.println(q.getContent());
            }
            // 질문-답변 리스트 생성
            List<Map<String, String>> questionList = new ArrayList<>();
            for (Question question : filteredQuestions) {
                Integer questionId = question.getId();

                String questionContent = question.getContent();

                List<Answer> answers = answerRepository.findByQuestionId(questionId);
                String answerContent = answers.isEmpty() ? "답변 없음" : answers.get(0).getContent();

                System.out.println("질문: " + questionContent);
                System.out.println("대답: " + answerContent);
                questionList.add(Map.of("question", questionContent, "answer", answerContent));
            }

            // 발표 데이터 저장
            Map<String, Object> presenterData = new HashMap<>();
            presenterData.put("presenter", presenter);
            presenterData.put("content", summaryContent);
            presenterData.put("questions", questionList);

            jsonData.add(presenterData);
        }

        // JSON 변환
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonPayload = objectMapper.writeValueAsString(jsonData);
        System.out.println("JSON Payload: " + jsonPayload);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "당신은 발표 진행 사회자입니다. 발표회가 종료되었고, 오늘 발표회의 내용을 요약본으로 정리해야 합니다.\n" +
                                        "아래 형식의 JSON을 생성해주세요. 백틱(```)이나 다른 마크다운 형식 없이 순수 JSON만 반환해야 합니다.\n" +
                                        "\n" +
                                        "{\n" +
                                        "    \"notion_rich_text\": {\n" +
                                        "        \"properties\": {\n" +
                                        "            \"title\": {\n" +
                                        "                \"title\": [\n" +
                                        "                    {\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"발표회 제목\"\n" +
                                        "                        }\n" +
                                        "                    }\n" +
                                        "                ]\n" +
                                        "            }\n" +
                                        "        },\n" +
                                        "        \"children\": []\n" +
                                        "    },\n" +
                                        "    \"pdf_html\": \"여기에 XHTML 코드가 문자열로 들어갑니다\"\n" +
                                        "}\n" +
                                        "\n" +
                                        "1. notion_rich_text 필드 구조:\n" +
                                        "   A. 제목 블록:\n" +
                                        "      - object: \"block\"\n" +
                                        "      - type: \"heading_1\"\n" +
                                        "      - 발표회 제목 (큰 글씨)\n" +
                                        "\n" +
                                        "   B. 날짜와 발표자 정보:\n" +
                                        "      - object: \"block\"\n" +
                                        "      - type: \"paragraph\"\n" +
                                        "      - 형식: \"\uD83D\uDCC5 [date를 'YYYY년 MM월 DD일 형식으로 반환]\"\n" +
                                        "      - 다음 줄: \"\uD83D\uDC65 [모든 presenter를 쉼표로 구분하여 나열]\"\n" +
                                        "\n" +
                                        "   C. 발표자별 섹션:\n" +
                                        "      - object: \"block\"\n" +
                                        "      - type: \"bulleted_list_item\"\n" +
                                        "      - 형식: \"[발표 요약을 2~3단어로 표현]\" \n \uD83D\uDC64 발표자명 \n " +
                                        "      예시: \"\uD83D\uDC64 환경 보호의 중요성 \"\n \uD83D\uDC64 홍길동" +
                                        "\n" +
                                        "   D. 발표 요약 (✨ 발표 요약):\n" +
                                        "      - object: \"block\"\n" +
                                        "      - type: \"paragraph\"\n" +
                                        "      - 제목: \"✨ 발표 요약\"\n" +
                                        "      - 번호가 매겨진 요약 내용\n" +
                                        "{\n" +
                                        "             \"object\": \"block\",\n" +
                                        "             \"type\": \"callout\",\n" +
                                        "             \"callout\": {\n" +
                                        "                 \"rich_text\": [{\n" +
                                        "                     \"type\": \"text\",\n" +
                                        "                     \"text\": { \"content\": \"✨ 발표 요약\\n[content 내용을 줄바꿈하여 표시]\" }\n" +
                                        "                 }],\n" +
                                        "                 \"icon\": { \"emoji\": \"✨\" }\n" +
                                        "             }\n" +
                                        "         }"+
                                        "\n" +
                                        "   E. 질의응답 (\uD83D\uDCAC 질의응답):\n" +
                                        "      - object: \"block\"\n" +
                                        "      - type: \"paragraph\"\n" +
                                        "      - 제목: \"\uD83D\uDCAC 질의응답\"\n" +
                                        "      - Q: 질문 내용\n" +
                                        "      - A: 답변 내용\n" +
                                        "{\n" +
                                        "             \"object\": \"block\",\n" +
                                        "             \"type\": \"callout\",\n" +
                                        "             \"callout\": {\n" +
                                        "                 \"rich_text\": [{\n" +
                                        "                     \"type\": \"text\",\n" +
                                        "                     \"text\": { \"content\": \"\uD83D\uDCAC 질의응답\\n[각 Q&A를 줄바꿈하여 표시]\" }\n" +
                                        "                 }],\n" +
                                        "                 \"icon\": { \"emoji\": \"\uD83D\uDCAC\" }\n" +
                                        "             }\n" +
                                        "         }" +
                                        "\n" +
                                        "2. pdf_html 필드 구조:\n" +
                                        "   ```html\n" +
                                        "   <!DOCTYPE html>\n" +
                                        "   <html>\n" +
                                        "   <head>\n" +
                                        "       <meta charset=\"UTF-8\">\n" +
                                        "       <style>\n" +
                                        "           body { font-family: Arial, sans-serif; line-height: 1.6; }\n" +
                                        "           .title { font-size: 24px; font-weight: bold; }\n" +
                                        "           .info { color: #666; margin: 10px 0; }\n" +
                                        "           .speaker { margin: 10px 0; }\n" +
                                        "           .speaker-topic { color: #555; font-style: italic; }\n" +
                                        "           .summary { margin: 15px 0; }\n" +
                                        "           .qa { margin: 15px 0; }\n" +
                                        "           .question { font-weight: bold; }\n" +
                                        "           .answer { margin-left: 20px; }\n" +
                                        "       </style>\n" +
                                        "   </head>\n" +
                                        "   <body>\n" +
                                        "       <!-- 동일한 구조로 HTML 컨텐츠 구성 -->\n" +
                                        "   </body>\n" +
                                        "   </html>\n" +
                                        "   ```\n" +
                                        "\n" +
                                        "3. 공통 규칙:\n" +
                                        "   - 이모지 사용:\n" +
                                        "     * 날짜: \uD83D\uDCC5\n" +
                                        "     * 발표자 목록: \uD83D\uDC65\n" +
                                        "     * 개별 발표자: \uD83D\uDC64\n" +
                                        "     * 발표 요약: ✨\n" +
                                        "     * 질의응답: \uD83D\uDCAC\n" +
                                        "   - 구조적 일관성:\n" +
                                        "     * 제목 → 정보 → 발표자/주제 → 요약 → 질의응답 순서\n" +
                                        "   - 발표자 키워드:\n" +
                                        "     * 각 발표자의 발표 내용을 2-3개의 핵심 키워드로 요약\n" +
                                        "     * 키워드는 간결하고 명확하게 작성\n" +
                                        "   - 포맷팅:\n" +
                                        "     * 질문/답변 쌍은 항상 Q/A 형식 유지\n" +
                                        "     * 모든 섹션은 명확한 구분자로 분리\n" +
                                        "\n" +
                                        "응답은 반드시 순수 JSON 형식이어야 하며, 불필요한 설명이나 마크다운을 포함하지 않아야 합니다."),
                        Map.of("role", "user", "content", jsonPayload)
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
                            // GPT 응답을 JSON으로 변환
                            Map<String, Object> contentMap = objectMapper.readValue(assistantContent, Map.class);

                            // notion_rich_text와 pdf_html 추출
                            Object notionRichText = contentMap.get("notion_rich_text");
                            String pdfHtml = (String) contentMap.get("pdf_html");

                            // Notion 데이터만 DB에 저장
                            FinalSummary finalSummary = new FinalSummary();
                            finalSummary.setRoom(room);
                            finalSummary.setNotionContent(objectMapper.writeValueAsString(notionRichText));
                            finalSummarizeRepository.save(finalSummary);

                            // JSON으로 응답 반환
                            return ResponseEntity.ok(Map.of(
                                    "notion_rich_text", notionRichText,
                                    "pdf_html", pdfHtml
                            ));
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
                    question.setPresentationOrder(presentationOrder);
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

}
