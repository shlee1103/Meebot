package com.ssafy.meebot.user.service;

import com.ssafy.meebot.user.entity.User;
import com.ssafy.meebot.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Map<String, String> getUserInformation(String userEmail) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("userEmail", user.getUserEmail());
        userInfo.put("profile", user.getProfile());
        userInfo.put("name", user.getName());
        userInfo.put("nickname", user.getNickname());

        return userInfo;
    }

    public void updateNickname(String userEmail, String nickname) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setNickname(nickname);
        userRepository.save(user);
    }
}