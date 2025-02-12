package com.ssafy.meebot.summary.entity;

import com.ssafy.meebot.room.entity.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "final_summaries")
public class FinalSummary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code", unique = true)
    private Room room;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
}
