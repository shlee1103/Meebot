package com.ssafy.meebot.openvidu.service;

import com.ssafy.meebot.openvidu.repository.OpenviduRepository;
import org.springframework.stereotype.Service;

@Service
public class OpenviduService {
    private final OpenviduRepository openviduRepository;

    public OpenviduService(OpenviduRepository openviduRepository) {
        this.openviduRepository = openviduRepository;
    }

    // 세션 id 존재하는지 확인
    public boolean sessionExists(String sessionId) {
        return openviduRepository.findByroomCode(sessionId).isPresent();
    }

}
