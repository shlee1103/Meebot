package com.ssafy.meebot.user.repository;

import com.ssafy.meebot.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // email → userEmail로 메서드명 변경
    Optional<User> findByUserEmail(String userEmail);
}