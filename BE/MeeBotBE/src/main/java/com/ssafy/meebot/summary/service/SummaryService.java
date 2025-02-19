package com.ssafy.meebot.summary.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.pdf.BaseFont;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.xhtmlrenderer.pdf.ITextTextRenderer;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;
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

    @Value("${pdf.storage.path}")
    private String pdfLocation;

    @Value("${pdf.logo.path}")
    private String logoBasePath;

    @Value("${pdf.font.path}")
    private String fontBasePath;

    private final String gptModel = "gpt-3.5-turbo";

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
        String roomTitle = (String) request.get("roomTitle");
        List<String> presenters = (List<String>) request.get("presenters");

        StringBuilder query = new StringBuilder();
        query.append("발표를 시작합니다. 총 ").append(presentationTeamsNum).append("명의 발표자가 발표하고, 한 명당 ")
                .append(presentationTime).append("분 동안 발표를 진행합니다. 발표 주제는 ")
                .append(roomTitle).append("이고, 질문 시간은 ")
                .append(questionTime).append("분이며, 발표 순서는 오른쪽 위의 발표회 정보를 참고해 주세요");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자 미유야. 너에 대한 간단한 소개, 발표 주제와 발표자 순서를 안내한 뒤, " +
                                        "'발표자는 화면 공유 버튼을 눌러 주세요. 그리고, 화면 공유가 완료되면 관리자는 발표 시작 버튼을 눌러 주세요. 라고 멘트해줘. " +
                                        "3줄로 요약하고 이모티콘 없이 텍스트로만 답변해줘. 끝에 감사합니다 같은 멘트는 하지마."),
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
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. 현재 발표자가 발표를 시작할거야." +
                                        "발표자가 이제 발표를 시작한다는 것을 안내해줘. 답변은 이모티콘 없이 텍스트로만 해줘." +
                                        "예를 들어, 이번 발표자는 [현재 발표자] 입니다. [멘트]"),
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
            String summaryContent = rootNode.get("text").asText();

            // 발표 순서와 동일한 질문 찾기
            int presentationOrder = summary.getPresentationOrder();
            List<Question> filteredQuestions = questions.stream()
                    .filter(q -> q.getPresentationOrder() != null && q.getPresentationOrder() == presentationOrder)
                    .toList();

            for (Question q : filteredQuestions) {
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
                "model", gptModel,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "당신은 발표 진행 사회자입니다. 발표회 종료 후 요약을 JSON 형식으로 작성합니다.\n" +
                                        "반드시 아래 형식의 JSON을 정확하게 생성하세요:\n" +
                                        "각 presenter마다 발표자 이름, 발표 요약, 질의응답 블록이 순서대로 반복되어야 합니다.\\n" +
                                        "\n" +
                                        "{\n" +
                                        "    \"notion_rich_text\": {\n" +
                                        "        \"properties\": {\n" +
                                        "            \"title\": {\n" +
                                        "                \"title\": [{\n" +
                                        "                    \"type\": \"text\",\n" +
                                        "                    \"text\": {\n" +
                                        "                        \"content\": \"[room_title]\"\n" +
                                        "                    }\n" +
                                        "                }]\n" +
                                        "            }\n" +
                                        "        },\n" +
                                        "        \"children\": [\n" +
                                        "            {\n" +
                                        "                \"object\": \"block\",\n" +
                                        "                \"type\": \"paragraph\",\n" +
                                        "                \"paragraph\": {\n" +
                                        "                    \"rich_text\": [{\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"📅 [YYYY년 MM월 DD일]\"\n" +
                                        "                        }\n" +
                                        "                    }]\n" +
                                        "                }\n" +
                                        "            },\n" +
                                        "            {\n" +
                                        "                \"object\": \"block\",\n" +
                                        "                \"type\": \"paragraph\",\n" +
                                        "                \"paragraph\": {\n" +
                                        "                    \"rich_text\": [{\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"🧑‍💻 \"\n" +
                                        "                        }\n" +
                                        "                    }, {\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"[presenter_names를 쉼표로 구분하여 나열]\"\n" +
                                        "                        }\n" +
                                        "                    }]\n" +
                                        "                }\n" +
                                        "            },\n" +
                                        "            {\n" +
                                        "                \"object\": \"block\",\n" +
                                        "                \"type\": \"paragraph\",\n" +
                                        "                \"paragraph\": {\n" +
                                        "                    \"rich_text\": [{\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"\\n\\n 🧑‍💻 [presenter_name]\"\n" +
                                        "                        }\n" +
                                        "                    }]\n" +
                                        "                }\n" +
                                        "            },\n" +
                                        "            {\n" +
                                        "                \"object\": \"block\",\n" +
                                        "                \"type\": \"callout\",\n" +
                                        "                \"callout\": {\n" +
                                        "                    \"rich_text\": [{\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \"발표 요약\\n\\n n1. [첫 번째 문장]\\n2. [두 번째 문장]\\n...\"\n" +
                                        "                        }\n" +
                                        "                    }],\n" +
                                        "                    \"icon\": { \"emoji\": \"✨\" }\n" +
                                        "                }\n" +
                                        "            },\n" +
                                        "            {\n" +
                                        "                \"object\": \"block\",\n" +
                                        "                \"type\": \"callout\",\n" +
                                        "                \"callout\": {\n" +
                                        "                    \"rich_text\": [{\n" +
                                        "                        \"type\": \"text\",\n" +
                                        "                        \"text\": {\n" +
                                        "                            \"content\": \" 질의응답\\n\\nQ: [질문]\\nA: [답변]\\n\\n...\"\n" +
                                        "                        }\n" +
                                        "                    }],\n" +
                                        "                    \"icon\": { \"emoji\": \"💬\" }\n" +
                                        "                }\n" +
                                        "            }\n" +
                                        "        ]\n" +
                                        "    },\n" +
                                        "    \"pdf_html\": {\n" +
                                        "        \"properties\": {\n" +
                                        "            \"title\": {\n" +
                                        "                \"title\": [{\n" +
                                        "                    \"type\": \"text\",\n" +
                                        "                    \"text\": {\n" +
                                        "                        \"content\": \"[room_title]\"\n" +
                                        "                    }\n" +
                                        "                }]\n" +
                                        "            }\n" +
                                        "        },\n" +
                                        "        \"children\": []\n" +
                                        "    }\n" +
                                        "}\n" +
                                        "\n" +
                                        "주의사항:\n" +
                                        "1. JSON 형식을 정확히 지켜주세요.\n" +
                                        "2. title 객체의 구조가 정확해야 합니다.\n" +
                                        "3. 각 presenter의 section은 순서대로 생성되어야 합니다.\n" +
                                        "4. content는 번호를 매겨 분리해주세요.\n" +
                                        "5. questions는 Q/A 형식으로 표기해주세요.\n" +
                                        "6. presenter_names는 실제 발표자 이름으로 대체되어야 합니다.\n" +
                                        "7. 불필요한 설명, 마크다운, 백틱 없이 순수 JSON만 반환하세요."
                        ),
                        Map.of("role", "user", "content", jsonPayload)
                ),
                "temperature", 0
        );


        generatePdfHtml(jsonPayload, roomCode)
                .subscribe(
                        result -> log.info("PDF generated successfully: {}", result),
                        error -> log.error("Failed to generate PDF", error)
                );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> messageMap = (Map<String, Object>) choices.get(0).get("message");
                        String assistantContent = (String) messageMap.get("content");

                        try {
                            // JSON 문자열을 Map으로 파싱
                            Map<String, Object> contentMap = objectMapper.readValue(assistantContent, Map.class);

                            // notion_rich_text
                            Object notionRichText = contentMap.get("notion_rich_text");

                            // Notion 데이터만 DB에 저장
                            FinalSummary finalSummary = new FinalSummary();
                            finalSummary.setRoom(room);
                            finalSummary.setNotionContent(objectMapper.writeValueAsString(notionRichText));
                            finalSummarizeRepository.save(finalSummary);


                            // JSON으로 응답 반환
                            return ResponseEntity.ok(Map.of(
                                    "notion_rich_text", notionRichText
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

    /**
     * PDF 생성용
     */
    private Mono<String> generatePdfHtml(String jsonPayload, String roomCode) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", """

                                당신은 XHTML 생성기입니다. 주어진 JSON 데이터를 기반으로 발표회 요약본을 XHTML 형식으로 생성해주세요.
                                                            응답은 반드시 단일 줄의 JSON 문자열이어야 합니다.
                                                            모든 줄바꿈은 리터럴 "\n"으로 대체되어야 합니다.
                                                            다음과 같은 형식으로 xhtml을 생성해주세요.         
                                                    
                                                            {
                                                                "xhtml": "<?xml version="1.0" encoding="UTF-8"?>
                                                                       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                                                                       <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
                                                                       <head>
                                                                           <meta charset="UTF-8" />
                                                                           <title>[room_title]</title>
                                                                           <style type="text/css">
                                                                               @font-face {
                                                                                   font-family: 'Malgun Gothic';
                                                                                   src: url('./fonts/malgun.ttf');
                                                                               }
                                                                               @font-face {
                                                                                   font-family: 'Noto Color Emoji';
                                                                                   src: url('./fonts/NotoColorEmoji-Regular.ttf');
                                                                               }
                                                                               body {\s
                                                                                   font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif;
                                                                                   margin: 40px;\s
                                                                               }
                                                                               .date, .presenters {
                                                                                   border-left: 4px solid #444;
                                                                                   padding-left: 10px;
                                                                                   margin-bottom: 10px;\s
                                                                                   display: flex;
                                                                                   align-items: center;
                                                                               }
                                                                               hr {
                                                                                   height: 1px;
                                                                                   border: none;
                                                                                   background-color: #D5D5D5;
                                                                               }
                                                                               h1 { text-align: center; font-size: 24px; margin-bottom: 20px; }
                                                                               .date { margin-bottom: 10px; }
                                                                               .presenters { margin-bottom: 20px; }
                                                                               .presenter-section { margin-bottom: 30px; }
                                                                               .presenter-name { font-size: 18px; margin-bottom: 15px; }
                                                                               .content-box {
                                                                                   background-color: #f9f9f9;
                                                                                   border: 1px solid #e1e1e1;
                                                                                   border-radius: 8px;
                                                                                   padding: 15px;
                                                                                   margin: 10px 0;
                                                                               }
                                                                               .qa-box {
                                                                                   background-color: #f5f5f5;
                                                                                   border: 1px solid #e1e1e1;
                                                                                   border-radius: 8px;
                                                                                   padding: 15px;
                                                                                   margin: 10px 0;
                                                                               }
                                                                               .qa-item { margin-bottom: 10px; }
                                                                               .copyright {
                                                                                   margin-top: 50px;
                                                                                   text-align: center;
                                                                                   font-size: 14px;
                                                                                   color: #666;
                                                                               }
                                                                               .copyright strong {
                                                                                   font-weight: bold;
                                                                                   color: #333;
                                                                               }
                                                                               .logo {
                                                                                   display: block;
                                                                                   margin: 10px auto;
                                                                                   width: 150px;
                                                                               }
                                                                           </style>
                                                                       </head>
                                                                       <body>
                                                                           <h1>[room_title 값]</h1>
                                                                           <br />
                                                                          \s
                                                                           <div class="date">
                                                                               [date를 'YYYY년 MM월 DD일' 형식으로 변환]
                                                                           </div>
                                                                           <div class="presenters">
                                                                               [모든 presenter를 쉼표로 구분하여 나열]
                                                                           </div>
                                                                       
                                                                           <br /><br />
                                                                       
                                                                           <!-- 각 발표자 정보 반복 -->
                                                                           [각 presenter에 대해 다음 구조 반복]
                                                                           <div class="presenter-section">
                                                                               <h3 class="presenter-name">
                                                                                   발표자 : [presenter 이름]
                                                                               </h3>
                                                                               <div class="content-box">
                                                                                   <strong>발표 요약</strong><br />
                                                                                   <hr />
                                                                                    [presenter의 content를 다음과 같이 번호와 줄바꿈을 포함하여 변환:
                                                                                                                                                              예시:
                                                                                                                                                              "1. 첫 번째 문장내용<br />\\n
                                                                                                                                                              2. 두 번째 문장내용<br />\\n
                                                                                                                                                              3. 세 번째 문장내용<br />\\n"
                                                                               </div>
                                                                       
                                                                               <br />
                                                                               [questions가 있는 경우에만]
                                                                               <div class="qa-box">
                                                                                   <strong>질의응답</strong><br />
                                                                                   <hr />
                                                                                   [각 question과 answer를 다음 형식으로]
                                                                                   <div class="qa-item">
                                                                                       Q: [question]<br />
                                                                                       A: [answer]
                                                                                   </div>
                                                                               </div>
                                                                              \s
                                                                               <br /><br /><br />
                                                                           </div>
                                                                       
                                                                            <hr />
                                                                           <div class="copyright">
                                                                               <strong>@Meebot</strong> 해당 요약본에 대한 저작권은 <strong>Meebot</strong>에 있습니다.
                                                                           </div>
                                                                       <br />
                                                                           <img src="[logo_path]" class="logo" alt="Meebot Logo" />
                                                                            </body>
                                                                       </html>
                                                                       "
                                                            }
                                                            
                                                            추가 지침:
                                                            1. 날짜는 'YYYY년 MM월 DD일' 형식으로 변환하세요.
                                                            2. 발표자 목록은 쉼표로 구분하여 나열하세요.
                                                            3. 각 발표자의 섹션은 위의 구조를 정확히 따르되, 질문이 없는 경우 qa-box는 생성하지 않습니다.
                                                            4. 모든 텍스트는 적절한 HTML 이스케이프 처리를 해야 합니다.
                                                            5. room_title은 가운데 정렬하세요.
                                                            6. content-box와 qa-box의 배경을 흰색으로 설정하세요.
                                                        """),
                        Map.of("role", "user", "content", jsonPayload)
                ),
                "temperature", 0.2
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> messageMap = (Map<String, Object>) choices.get(0).get("message");
                        String assistantContent = (String) messageMap.get("content");

                        try {
                            assistantContent = assistantContent.trim().replaceAll("\\R", "");
                            ObjectMapper objectMapper = new ObjectMapper();
                            JsonNode rootNode = objectMapper.readTree(assistantContent);
                            String xhtmlContent = rootNode.get("xhtml").asText()
                                    .replace("\\n", "\n")
                                    .replace("\\\"", "\"");

                            String fileName = roomCode + ".pdf";
                            String filePath = pdfLocation + File.separator + fileName;

                            File directory = new File(pdfLocation);
                            if (!directory.exists()) {
                                directory.mkdirs();
                            }

                            // MeeBot 로고의 실제 파일 경로 가져오기
                            String resolvedLogoPath = getLogoPath();
                            xhtmlContent = xhtmlContent.replace("[logo_path]", resolvedLogoPath);

                            // PDF 렌더러 설정
                            ITextRenderer renderer = new ITextRenderer();
                            renderer.getSharedContext().setTextRenderer(new ITextTextRenderer());

                            // 폰트 로드
                            String pretendardFontPath = getFontPath();
                            renderer.getFontResolver().addFont(
                                    pretendardFontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED
                            );


                            // PDF 생성
                            renderer.setDocumentFromString(xhtmlContent);
                            renderer.layout();

                            try (FileOutputStream os = new FileOutputStream(filePath)) {
                                renderer.createPDF(os);
                            }

                            log.info("PDF 저장 경로: {}", filePath);

                            // 생성된 PDF 링크를 데이터베이스에 저장
                            return savePdfLinkToDatabase(roomCode, filePath)
                                    .thenReturn(filePath);

                        } catch (Exception e) {
                            log.error("PDF 생성 실패 상세: ", e);
                            return Mono.error(new RuntimeException("PDF 생성 실패: " + e.getMessage(), e));
                        }
                    }
                    return Mono.error(new RuntimeException("잘못된 GPT 응답"));
                });
    }


    public String getLogoPath() throws IOException {
        if (logoBasePath.startsWith("classpath:")) {
            // 로컬
            ClassPathResource resource = new ClassPathResource(logoBasePath.substring(10) + "/MeeBot_Logo.png");
            return "file:///" + resource.getFile().getAbsolutePath().replace("\\", "/");
        } else {
            // 배포
            return "file:///" + logoBasePath + "/MeeBot_Logo.png";
        }
    }

    private String getFontPath() {
        try {
            if (fontBasePath.startsWith("classpath:")) {
                String fontPath = fontBasePath.substring("classpath:".length()) + "/malgun.ttf";
                ClassPathResource resource = new ClassPathResource(fontPath);
                return resource.getFile().getAbsolutePath();
            } else {
                // 일반 파일 시스템 경로인 경우
                return fontBasePath + "/malgun.ttf";
            }
        } catch (IOException e) {
            log.error("Font file not found: {}", e.getMessage());
            throw new RuntimeException("Font file not found: " + e.getMessage());
        }
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

    private Mono<Void> savePdfLinkToDatabase(String roomCode, String pdfPath) {
        return Mono.fromCallable(() -> {
            Optional<FinalSummary> summaryOptional = Optional.ofNullable(finalSummarizeRepository.findByRoom_RoomCode(roomCode));
            if (summaryOptional.isPresent()) {
                FinalSummary summary = summaryOptional.get();
                summary.setPdfLink(pdfPath);
                finalSummarizeRepository.save(summary);
                log.info("PDF 링크 저장 완료: {}", pdfPath);
            } else {
                log.warn("PDF 저장 실패: roomCode {}에 해당하는 데이터가 없음", roomCode);
            }
            return null;
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    public String getPdfLinkByRoomCode(String roomCode) {
        FinalSummary summary = finalSummarizeRepository.findByRoom_RoomCode(roomCode);

        if (summary == null) {
            throw new IllegalArgumentException("해당 roomCode에 대한 PDF 링크가 존재하지 않습니다: " + roomCode);
        }

        return summary.getPdfLink();
    }

    public Mono<String> generateEndingMessage(Map<String, Object> request) {
        String roomTitle = (String) request.get("roomTitle");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 발표 진행을 맡은 사회자고 이름은 미유야. " +
                                        "발표회가 모두 끝났어. 발표회를 마무리하는 감동적이고 마음을 울릴만한 멘트를 해줘. " +
                                        "발표자들을 응원하고 격려하는 내용을 포함해줘. 안녕하세요는 빼주면 좋겠어. 3~4줄 정도로 말해줘." +
                                        "마지막으로 지금까지 사회자 미유였습니다. 감사합니다. 멘트를 해줘."),
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

    public Mono<String> endPresentation(Map<String, Object> request) {
        String presenter = (String) request.get("presenter");
        String transcripts = (String) request.get("transcripts");

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "너는 발표 진행을 맡은 사회자야." +
                                "한 사람의 발표가 끝났어. 지금까지 누구의 발표였는지에 대한 멘트 이후, " +
                                "발표 내용 한 줄 요약, 마지막으로 발표에 대한 소감을 한 문장으로 추가해 줘." +
                                "3줄로 요약해서 하나의 문장으로 작성해줘" +
                                "그리고 마지막으로 관리자는 질의응답을 시작하기 위해 질의응답 시작 버튼을 눌러주세요. 라고 안내해줘"),
                        Map.of("role", "user", "content", String.format(
                                "다음은 %s님의 발표 내용입니다:\n\n\"%s\"\n\n",
                                presenter, transcripts
                        ))
                ),
                "temperature", 0.7
        );

        // OpenAI API 호출
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
                    return "OPENAI 호출 오류";
                });
    }
}
