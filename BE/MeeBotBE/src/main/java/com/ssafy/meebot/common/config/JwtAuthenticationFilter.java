package com.ssafy.meebot.common.config;

import com.ssafy.meebot.common.security.CustomUserDetails;
import com.ssafy.meebot.common.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final String jwtSecretKey;

    public JwtAuthenticationFilter(String jwtSecretKey) {
        this.jwtSecretKey = jwtSecretKey;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // 토큰 검증이 필요없는 경로는 바로 통과(수정)
        if (requestURI.equals("/api/v1/oauth2/google") ||    // 구글 로그인 관련 (GET, POST)
                requestURI.equals("/api/v1/refresh") ||          // 토큰 갱신
                requestURI.equals("/oauth/callback") ||          // 구글 OAuth 콜백
                requestURI.equals("/") ||                        // 루트 경로
                requestURI.startsWith("/api/sessions") ||        // OpenVidu 세션 관련
                requestURI.startsWith("/api/chatgpt") || requestURI.startsWith("/api/notion/login") || requestURI.startsWith("/api/auth/notion/callback")) {         // ChatGPT 관련 API (하위 경로 모두 포함)
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Invalid or missing Authorization header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);
        System.out.println("Extracted Token: " + token);

        if (JwtUtil.isTokenExpired(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token has expired\"}");
            return;
        }

        String email = JwtUtil.extractEmail(token);

        CustomUserDetails userDetails = new CustomUserDetails(email, null);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        System.out.println("Token is valid, proceeding to controller");
        filterChain.doFilter(request, response);
    }
}