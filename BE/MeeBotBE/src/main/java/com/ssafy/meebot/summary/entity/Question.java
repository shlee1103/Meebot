package com.ssafy.meebot.summary.entity;

import com.ssafy.meebot.room.entity.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "questions")
public class Question {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code")
    private Room room;

    @Column(name = "content")
    private String content;

    @Column(name = "question_order")
    private Integer questionOrder;
}
