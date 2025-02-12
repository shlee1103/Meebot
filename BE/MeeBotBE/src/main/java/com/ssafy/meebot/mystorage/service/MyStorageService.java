package com.ssafy.meebot.mystorage.service;

import com.ssafy.meebot.mystorage.dto.MyStorageResponse;
import com.ssafy.meebot.mystorage.repository.MyStorageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MyStorageService {

    private final MyStorageRepository myStorageRepository;

    public List<MyStorageResponse> getSummariesByUserEmail(String userEmail) {
        if (!myStorageRepository.existsByUserEmail(userEmail)) {
            throw new IllegalArgumentException("참가한 세션 정보를 찾지 못했습니다.");
        }

        return myStorageRepository.findSummariesByUserEmail(userEmail);
    }

    public void deleteStorageSummary(String roomCode, String userEmail) {
        if (!myStorageRepository.existsByRoomCodeAndUserEmail(roomCode, userEmail)) {
            throw new IllegalArgumentException("이 세션에 참가했던 정보를 찾지 못했습니다. : " + roomCode);
        }

        myStorageRepository.softDeleteByRoomCodeAndUserEmail(roomCode, userEmail);
    }

}
