package com.ssafy.meebot.room.controller;


import com.ssafy.meebot.common.util.JwtUtil;
import com.ssafy.meebot.room.entity.Room;
import com.ssafy.meebot.room.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@Slf4j
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Value("${jwt.secret.key}")
    private String jwtSecretKey;

    // 방 제목 변경하기(코드 그대로, 수정필요)
    @PutMapping("/{roomCode}/title")  // code -> roomCode
    public ResponseEntity<String> updateTitle(
            @PathVariable String roomCode,
            @RequestBody Map<String, String> request) {
        roomService.updateTitle(roomCode, request.get("roomTitle"));  // title -> roomTitle
        return ResponseEntity.ok("Room title updated successfully");
    }

    // 회의방 정보 저장 기능
    @PostMapping
    public ResponseEntity<Room> makeRoom(@RequestBody Room room) {
        return ResponseEntity.ok(roomService.createRoom(room));
    }


    // 호스트 이메일 변경
    @PutMapping("/{roomCode}/host")  // code -> roomCode
    public ResponseEntity<String> updateHostEmail(
            @PathVariable String roomCode,
            @RequestBody Map<String, String> request) {
        roomService.updateHostEmail(roomCode, request.get("hostEmail"));
        return ResponseEntity.ok("Host updated successfully");
    }

    // 현재 로그인 한 사용자의 방 정보 가져오기
    @GetMapping("/my/rooms")
    public ResponseEntity<List<Room>> getMyRooms(@RequestHeader("Authorization") String token) {
        log.info("Getting rooms for authenticated user");
        String userEmail = JwtUtil.validateToken(jwtSecretKey, token.substring(7));
        return ResponseEntity.ok(roomService.getMyRooms(userEmail));
    }

}