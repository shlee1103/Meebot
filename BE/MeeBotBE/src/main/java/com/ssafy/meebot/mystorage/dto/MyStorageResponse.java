package com.ssafy.meebot.mystorage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@AllArgsConstructor
public class MyStorageResponse {

    private String roomCode;
    private String roomTitle;
    private String content;
    private LocalDateTime createdAt;
}
