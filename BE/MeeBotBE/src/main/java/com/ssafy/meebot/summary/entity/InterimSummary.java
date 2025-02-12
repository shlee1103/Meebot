package com.ssafy.meebot.summary.entity;

import com.ssafy.meebot.room.entity.Room;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "script_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterimSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code")
    private Room room;

    @Column(name = "presenter")
    private String presenter;

    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "presentation_order")
    private Integer presentationOrder;
}
