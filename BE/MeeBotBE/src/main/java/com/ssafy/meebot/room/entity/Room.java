package com.ssafy.meebot.room.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @Column(name = "room_code", length = 10)
    private String roomCode;  // code -> roomCode

    @Column(name = "host_email", length = 50)
    private String hostEmail;

    @Column(name = "title", length = 45)  // title -> roomTitle
    private String roomTitle;

    @Column(name = "created_at")
    private LocalDateTime createdAt;  // Timestamp -> LocalDateTime
}