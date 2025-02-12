package com.ssafy.meebot.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Column(name = "user_email", length = 50)
    private String userEmail;

    @Column(length = 255)
    private String profile;

    @Column(length = 20)
    private String name;

    @Column(length = 20)
    private String nickname;

    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}