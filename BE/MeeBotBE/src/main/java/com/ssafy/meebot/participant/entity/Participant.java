package com.ssafy.meebot.participant.entity;
import com.ssafy.meebot.mystorage.domain.StorageStatus;
import com.ssafy.meebot.room.entity.Room;
import com.ssafy.meebot.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "participants")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Integer participantId;  // id -> participantId

    @Column(name = "room_code", length = 10)
    private String roomCode;

    @Column(name = "user_email", length = 50)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "deleted", nullable = false)
    private StorageStatus deleted = StorageStatus.ACTIVE;
}