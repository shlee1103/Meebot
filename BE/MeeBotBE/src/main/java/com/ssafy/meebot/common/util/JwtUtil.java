package com.ssafy.meebot.common.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;

public class JwtUtil {
    public static String createAccessToken(String secretKey, long expiration, String email) {
        return JWT.create()
                .withSubject("user_token")
                .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
                .withClaim("email", email)
                .withClaim("type", "access")
                .sign(Algorithm.HMAC512(secretKey));
    }

    public static String createRefreshToken(String secretKey, long expiration, String email) {
        return JWT.create()
                .withSubject("user_token")
                .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
                .withClaim("email", email)
                .withClaim("type", "refresh")
                .sign(Algorithm.HMAC512(secretKey));
    }

    // access token으로 user email 전달
    public static String validateToken(String secretKey, String token) throws JWTVerificationException {
        DecodedJWT jwt = JWT.require(Algorithm.HMAC512(secretKey))
                .build()
                .verify(token);
        return jwt.getClaim("email").asString();
    }

    public static boolean isTokenExpired(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            Date expirationDate = jwt.getExpiresAt();
            Date currentDate = new Date();

            System.out.println("Token Expiration Date: " + expirationDate);
            System.out.println("Current Date: " + currentDate);
            System.out.println("Is Expired: " + expirationDate.before(currentDate));

            return expirationDate.before(currentDate);
        } catch (Exception e) {
            return true;
        }
    }

    public static String extractEmail(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return jwt.getClaim("email").asString();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token");
        }
    }
}