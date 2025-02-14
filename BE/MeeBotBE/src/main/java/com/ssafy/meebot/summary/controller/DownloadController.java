package com.ssafy.meebot.summary.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.ssafy.meebot.summary.service.NotionService;
import com.ssafy.meebot.summary.service.SummaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.io.File;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DownloadController {

    private final NotionService notionService;

    private SummaryService summaryService;

    public DownloadController(NotionService notionService, SummaryService summaryService) {
        this.notionService = notionService;
        this.summaryService = summaryService;
    }

    private static final String NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize";
    private static final String NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";
    private static final String NOTION_USER_URL = "https://api.notion.com/v1/users/me";

    @Value("${notion.client.id}")
    private String clientId;

    @Value("${notion.client.secret}")
    private String clientSecret;

    @Value("${notion.base.uri}")
    private String baseUri;

    @Value("${jwt.secret.key}")
    private String jwtSecretKey;

    @Value("${pdf.storage.path}")
    private String pdfStoragePath;

    private String generateStateToken() {
        String stateValue = UUID.randomUUID().toString();
        String token = JWT.create()
                .withIssuer("meebot")
                .withClaim("state", stateValue) // JWT Payload에 state 저장
                .withExpiresAt(new Date(System.currentTimeMillis() + 5 * 60 * 1000)) // 5분 유효기간
                .sign(Algorithm.HMAC256(jwtSecretKey)); // JWT 서명

        System.out.println("Generated State Token: " + token);
        return token;
    }

    @GetMapping("/notion/login")
    public ResponseEntity<Void> getNotionLoginUrl(@RequestParam String roomCode) {
        String stateWithRoomCode = generateStateToken() + "|" + (roomCode);  // JWT 기반 state 생성 + roomCode
        String encodedState = URLEncoder.encode(stateWithRoomCode, StandardCharsets.UTF_8); // 인코딩
        String encodedRedirectUri = baseUri + "/api/auth/notion/callback";
        String notionAuthUrl = NOTION_AUTH_URL
                + "?client_id=" + clientId
                + "&response_type=code"
                + "&redirect_uri=" + encodedRedirectUri
                + "&state=" + encodedState
                + "&owner=user"
                + "&scope=read_user,read_content";

        System.out.println("Redirecting to Notion Auth URL: " + notionAuthUrl);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(notionAuthUrl))
                .build();
    }

    @GetMapping(value = "/auth/notion/callback", produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
    public Mono<ResponseEntity<String>> callback(@RequestParam String code,
                                                 @RequestParam(required = false) String state) {

        String decodedState = URLDecoder.decode(state, StandardCharsets.UTF_8);
        // roomCode 추출
        String[] stateParts = decodedState.split("\\|");
        String stateToken = stateParts[0];  // 원래 state 값
        String roomCode = stateParts.length > 1 ? stateParts[1] : "null";

        // JWT 기반 state 검증
        if (!verifyStateToken(stateToken)) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid state parameter. Possible CSRF attack."));
        }

        String redirectUri = baseUri + "/api/auth/notion/callback";

        return notionService.getAccessToken(clientId, clientSecret, code, redirectUri)
                .flatMap(accessToken -> {
                    if (accessToken == null) {
                        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Failed to retrieve access token."));
                    }

                    return notionService.getUserAllowedParentInfo(accessToken)
                            .flatMap(parentInfo -> {
                                if (parentInfo == null || !parentInfo.containsKey("id") || !parentInfo.containsKey("type")) {
                                    return Mono.just(ResponseEntity.badRequest()
                                            .body("Failed to find a valid parent page or database."));
                                }

                                String parentId = parentInfo.get("id");
                                int parentType = switch (parentInfo.get("type")) {
                                    case "database" -> 0;
                                    case "page" -> 1;
                                    case "workspace" -> 2;
                                    default -> -1;
                                };

                                return notionService.createSubPage(accessToken, parentId, parentType, roomCode)
                                        .flatMap(notionPageUrl -> {
                                            if (notionPageUrl == null || notionPageUrl.contains("Failed")) {
                                                return Mono.just(ResponseEntity.badRequest().build());
                                            }

                                            System.out.println("URL  :" + notionPageUrl);
                                            HttpHeaders headers = new HttpHeaders();
                                            headers.set("Location", notionPageUrl);
                                            return Mono.just(new ResponseEntity<>(headers, HttpStatus.FOUND)); // 302 Redirect
                                        });
                            });
                });
    }


    /**
     * Notion Workspace 정보
     */
    private boolean verifyStateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecretKey);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("meebot")
                    .build();
            DecodedJWT jwt = verifier.verify(token);

            System.out.println("JWT State Verified Successfully: " + jwt.getClaim("state").asString());
            return jwt.getClaim("state").asString() != null;
        } catch (JWTVerificationException e) {
            System.out.println("JWT Verification Failed: " + e.getMessage());
            return false; // 유효하지 않은 state
        }
    }

    @GetMapping("/download/pdf")
    public ResponseEntity<Resource> downloadPdf(@RequestParam String roomCode) {
        try {
            // summaryService를 통해 PDF 링크 조회
            String pdfFilePath = summaryService.getPdfLinkByRoomCode(roomCode);

            if (pdfFilePath == null || pdfFilePath.isEmpty()) {
                System.out.println("PDF 다운로드 실패: roomCode {}에 대한 PDF 링크 없음" + roomCode);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            File pdfFile = new File(pdfFilePath);

            if (!pdfFile.exists()) {
                System.out.println("PDF 파일 없음: {}" + pdfFilePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            Path path = pdfFile.toPath();
            Resource resource = new UrlResource(path.toUri());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdfFile.getName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            System.out.println("PDF 다운로드 오류: " + e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
