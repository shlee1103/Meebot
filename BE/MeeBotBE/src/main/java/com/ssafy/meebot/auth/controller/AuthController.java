package com.ssafy.meebot.auth.controller;

import com.ssafy.meebot.auth.dto.GoogleInfResponse;
import com.ssafy.meebot.auth.dto.GoogleRequest;
import com.ssafy.meebot.auth.dto.GoogleResponse;
import com.ssafy.meebot.common.util.JwtUtil;
import com.ssafy.meebot.user.entity.User;
import com.ssafy.meebot.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1")
public class AuthController {
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30L; // 30분
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 14L; // 14일

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.pw}")
    private String googleClientPw;

    @Value("${jwt.secret.key}")
    private String jwtSecretKey;

    @Value("${app.base.url}")
    private String baseUrl; // application.properties에서 자신의 local 주소로 변경

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public AuthController(UserRepository userRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/oauth2/google")
    public ResponseEntity<String> loginUrlGoogle() {
        String url = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + googleClientId
                + "&redirect_uri=" + URLEncoder.encode(baseUrl + "/oauth/callback", StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=email%20profile%20openid"
                + "&access_type=offline"
                + "&prompt=consent";

        return ResponseEntity.ok(url);
    }

    @GetMapping("/oauth2/google")
    public ResponseEntity<Map<String, Object>> loginGoogle(@RequestParam String code) {
        try {
            GoogleResponse googleResponse = getGoogleTokens(code);
            GoogleInfResponse userInfo = getGoogleUserInfo(googleResponse.getId_token());

            String accessToken = JwtUtil.createAccessToken(jwtSecretKey, ACCESS_TOKEN_EXPIRATION, userInfo.getEmail());
            String refreshToken = JwtUtil.createRefreshToken(jwtSecretKey, REFRESH_TOKEN_EXPIRATION, userInfo.getEmail());

            User user = updateOrCreateUser(userInfo, refreshToken);

            Map<String, Object> response = new HashMap<>();
            response.put("access_token", accessToken);
            response.put("refresh_token", refreshToken);
            response.put("userEmail", user.getUserEmail());  // email → userEmail
            response.put("name", user.getName());
            response.put("profile", user.getProfile());
            // 정보 전달합니다.

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", "Authentication failed: " + e.getMessage()));
        }
    }


    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
        try {
            String userEmail = JwtUtil.validateToken(jwtSecretKey, refreshToken);

            Optional<User> user = userRepository.findByUserEmail(userEmail);  // findByEmail → findByUserEmail
            if (user.isEmpty() || !user.get().getRefreshToken().equals(refreshToken)) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid refresh token"));
            }

            String newAccessToken = JwtUtil.createAccessToken(jwtSecretKey, ACCESS_TOKEN_EXPIRATION, userEmail);

            return ResponseEntity.ok(Collections.singletonMap("access_token", newAccessToken));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid refresh token"));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);

        String userEmail = JwtUtil.validateToken(jwtSecretKey, token);

        Optional<User> user = userRepository.findByUserEmail(userEmail);  // findByEmail → findByUserEmail

        if (user.isPresent()) {
            user.get().setRefreshToken(null);
            userRepository.save(user.get());
            return ResponseEntity.ok("Logged out successfully");
        }

        return ResponseEntity.status(401).body("User not found");
    }

    private GoogleResponse getGoogleTokens(String authCode) {
        GoogleRequest request = GoogleRequest.builder()
                .clientId(googleClientId)
                .clientSecret(googleClientPw)
                .code(authCode)
                .redirectUri(baseUrl + "/oauth/callback")
                .grantType("authorization_code")
                .build();

        return restTemplate.postForEntity("https://oauth2.googleapis.com/token",
                request, GoogleResponse.class).getBody();
    }
    private GoogleInfResponse getGoogleUserInfo(String idToken) {
        return restTemplate.postForEntity("https://oauth2.googleapis.com/tokeninfo",
                Collections.singletonMap("id_token", idToken), GoogleInfResponse.class).getBody();
    }

    private User updateOrCreateUser(GoogleInfResponse userInfo, String refreshToken) {
        return userRepository.findByUserEmail(userInfo.getEmail())  // findByEmail → findByUserEmail
                .map(user -> {
                    user.setRefreshToken(refreshToken);
                    user.setNickname(userInfo.getName());
                    return userRepository.save(user);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .userEmail(userInfo.getEmail())  // email → userEmail
                        .name(userInfo.getName())
                        .profile(userInfo.getPicture())
                        .nickname(userInfo.getName())
                        .refreshToken(refreshToken)
                        .createdAt(LocalDateTime.now())  // createdAt 필드 추가
                        .build()));
    }
}