package com.ssafy.meebot.summary.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.meebot.summary.repository.FinalSummarizeRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class NotionService {
    private static final String NOTION_VERSION = "2022-06-28";
    private final WebClient webClient;
    private final FinalSummarizeRepository finalSummarizeRepository;

    public NotionService(WebClient.Builder webClientBuilder, FinalSummarizeRepository finalSummarizeRepository) {
        this.webClient = webClientBuilder.baseUrl("https://api.notion.com/v1").build();
        this.finalSummarizeRepository = finalSummarizeRepository;
    }

    /**
     *
     * 하위 페이지 생성
     *
     * @param accessToken
     * @param parentId
     * @param parentType
     * @param roomCode
     * @return
     */
    public Mono<String> createSubPage(String accessToken, String parentId, int parentType, String roomCode) {
        if (parentId == null || parentId.isEmpty()) {
            return Mono.error(new IllegalArgumentException("Invalid parent ID."));
        }

        // 부모 페이지 판단
        Map<String, Object> parent = switch (parentType) {
            case 0 -> Map.of("database_id", parentId);
            case 1, 2 -> Map.of("page_id", parentId);
            default -> throw new IllegalArgumentException("Invalid parent type code: " + parentType);
        };

        return Mono.defer(() -> Mono.justOrEmpty(finalSummarizeRepository.findByRoom_RoomCode(roomCode)))
                .switchIfEmpty(Mono.error(new RuntimeException("No summary found for roomCode: " + roomCode)))
                .flatMap(finalSummary -> {
                    String notionContentJson = finalSummary.getNotionContent();
                    ObjectMapper objectMapper = new ObjectMapper();
                    Map<String, Object> notionData;
                    try {
                        notionData = objectMapper.readValue(notionContentJson, new TypeReference<>() {});
                    } catch (JsonProcessingException e) {
                        return Mono.error(new RuntimeException("Error parsing Notion content JSON", e));
                    }

                    LinkedHashMap<String, Object> requestBody = new LinkedHashMap<>();
                    requestBody.put("parent", parent);

                    Map<String, Object> properties = new LinkedHashMap<>();
                    Map<String, Object> titleProperty = extractTitleProperty(notionData);
                    if (titleProperty != null) {
                        properties.put("title", titleProperty);
                    }
                    requestBody.put("properties", properties);

                    requestBody.put("children", transformChildrenBlocks(notionData));

                    System.out.println("Request Body: " + requestBody);

                    return webClient.post()
                            .uri("/pages")
                            .headers(headers -> {
                                headers.setBearerAuth(accessToken);
                                headers.set("Notion-Version", NOTION_VERSION);
                                headers.setContentType(MediaType.APPLICATION_JSON);
                            })
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .map(response -> response.get("id").toString().replaceAll("-", ""))
                            .map(id -> "https://www.notion.so/" + id);
                });
    }

    private List<Map<String, Object>> transformChildrenBlocks(Map<String, Object> notionData) {
        List<Map<String, Object>> transformedChildren = new ArrayList<>();

        // Add title as heading
        transformedChildren.add(createHeadingBlock(getTitleContent(notionData)));

        List<Map<String, Object>> children = (List<Map<String, Object>>) notionData.get("children");
        if (children != null && !children.isEmpty()) {
            for (Map<String, Object> block : children) {
                String type = (String) block.get("type");

                switch (type) {
                    case "paragraph" -> {
                        Map<String, Object> paragraph = (Map<String, Object>) block.get("paragraph");
                        List<Map<String, Object>> richText = (List<Map<String, Object>>) paragraph.get("rich_text");
                        if (!richText.isEmpty()) {
                            String content = (String) ((Map<String, Object>) richText.get(0).get("text")).get("content");
                            transformedChildren.add(createParagraphBlock(content));
                        }
                    }
                    case "bulleted_list_item" -> {
                        Map<String, Object> item = (Map<String, Object>) block.get("bulleted_list_item");
                        List<Map<String, Object>> richText = (List<Map<String, Object>>) item.get("rich_text");
                        if (!richText.isEmpty()) {
                            String content = (String) ((Map<String, Object>) richText.get(0).get("text")).get("content");
                            transformedChildren.add(createBulletedListItemBlock(content));
                        }
                    }
                    case "callout" -> {
                        Map<String, Object> callout = (Map<String, Object>) block.get("callout");
                        List<Map<String, Object>> richText = (List<Map<String, Object>>) callout.get("rich_text");
                        Map<String, Object> icon = (Map<String, Object>) callout.get("icon");
                        if (!richText.isEmpty()) {
                            String content = (String) ((Map<String, Object>) richText.get(0).get("text")).get("content");
                            String emoji = (String) icon.get("emoji");
                            transformedChildren.add(createCalloutBlock(content, emoji, "gray_background"));
                        }
                    }
                }
            }
        }

        return transformedChildren;
    }

    private Map<String, Object> createHeadingBlock(String content) {
        return Map.of(
                "object", "block",
                "type", "heading_1",
                "heading_1", Map.of(
                        "rich_text", List.of(Map.of(
                                "type", "text",
                                "text", Map.of("content", content),
                                "annotations", Map.of("bold", true)
                        ))
                )
        );
    }

    private Map<String, Object> createParagraphBlock(String content) {
        return Map.of(
                "object", "block",
                "type", "paragraph",
                "paragraph", Map.of(
                        "rich_text", List.of(Map.of(
                                "type", "text",
                                "text", Map.of("content", content)
                        ))
                )
        );
    }

    private Map<String, Object> createBulletedListItemBlock(String content) {
        return Map.of(
                "object", "block",
                "type", "bulleted_list_item",
                "bulleted_list_item", Map.of(
                        "rich_text", List.of(Map.of(
                                "type", "text",
                                "text", Map.of("content", content)
                        ))
                )
        );
    }

    private Map<String, Object> createCalloutBlock(String content, String emoji, String color) {
        Map<String, Object> block = new LinkedHashMap<>();
        block.put("object", "block");
        block.put("type", "callout");

        Map<String, Object> callout = new LinkedHashMap<>();
        callout.put("rich_text", List.of(Map.of(
                "type", "text",
                "text", Map.of("content", content)
        )));
        callout.put("icon", Map.of("emoji", emoji));
        callout.put("color", color);

        block.put("callout", callout);
        return block;
    }

    private Map<String, Object> extractTitleProperty(Map<String, Object> notionData) {
        Map<String, Object> title = new LinkedHashMap<>();
        title.put("title", List.of(Map.of(
                "type", "text",
                "text", Map.of("content", getTitleContent(notionData))
        )));
        return title;
    }

    private String getTitleContent(Map<String, Object> notionData) {
        if (notionData.containsKey("properties")) {
            Map<String, Object> properties = (Map<String, Object>) notionData.get("properties");
            if (properties.containsKey("title")) {
                Map<String, Object> titleProp = (Map<String, Object>) properties.get("title");
                List<Map<String, Object>> titleArray = (List<Map<String, Object>>) titleProp.get("title");
                if (titleArray != null && !titleArray.isEmpty()) {
                    return (String) ((Map<String, Object>) titleArray.get(0).get("text")).get("content");
                }
            }
        }
        return "Untitled";
    }


    /**
     *
     * 사용자가 허용한 가장 첫 페이지
     * @param accessToken
     * @return
     */
    public Mono<Map<String, String>> getUserAllowedParentInfo(String accessToken) {
        return webClient.post()
                .uri("/search")
                .headers(headers -> {
                    headers.setBearerAuth(accessToken);
                    headers.set("Notion-Version", NOTION_VERSION);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

                    // parent.type이 workspace인 첫 번째 항목 찾기
                    if (results != null && !results.isEmpty()) {
                        Optional<Map<String, Object>> workspaceItem = results.stream()
                                .filter(item -> {
                                    Map<String, Object> parent = (Map<String, Object>) item.get("parent");
                                    return parent != null && "workspace".equals(parent.get("type"));
                                })
                                .findFirst();

                        if (workspaceItem.isPresent()) {
                            Map<String, Object> firstResult = workspaceItem.get();
                            String objectType = firstResult.get("object").toString();
                            String id = firstResult.get("id").toString();

                            // database와 page 타입 구분
                            if ("database".equals(objectType)) {
                                return Map.of("id", id, "type", "database");
                            } else if ("page".equals(objectType)) {
                                return Map.of("id", id, "type", "page");
                            }
                        }
                    }
                    return null;
                });
    }

    public Mono<String> getAccessToken(String clientId, String clientSecret, String code, String redirectUri) {
        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        return webClient.post()
                .uri("/oauth/token")
                .headers(headers -> {
                    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                    headers.set("Authorization", "Basic " + encodedAuth);
                })
                .bodyValue("grant_type=authorization_code&code=" + code + "&redirect_uri=" + redirectUri)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> response.get("access_token").toString());
    }

}

