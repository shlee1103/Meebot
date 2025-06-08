# MeeBot - AI 사회자 서비스

### 📜 목차
 1. [소개](#-소개)
 2. [서비스 화면](#서비스-화면)
 3. [주요 기능](#-주요-기능)
 4. [개발 환경](#%EF%B8%8F-개발-환경)
 5. [시스템 아키텍처](#시스템-아키텍처)
 6. [ERD](#ERD)
 7. [구성원](#구성원)
---

## 🤍 소개
매 순간 발표를 경청하고 기록하는 과정은 발표자와 청중 모두에게 부담이 될 수 있습니다.

참가자들은 중요한 내용을 메모하느라 발표에 온전히 집중하지 못하고, 불가피한 자리 이석으로 발표 내용을 놓치기도 합니다.

또한 발표 내용을 제대로 이해하지 못해 질의응답 시간에 소극적인 태도를 보이게 되며, 이는 참가자들의 참여도 저하로 이어집니다.

**MeeBot**은 발표회의 효율적인 진행과 기록을 돕는 **AI 기반 발표 지원 시스템**입니다.  MeeBot은 발표를 실시간으로 진행하고 기록하며, **자동 요약** 및 Q&A 정리를 통해 보다 **효율적인 발표 환경**을 제공합니다.

<h2 id="서비스-화면">🖼️ 서비스 화면</h2>

### 온보딩
#### 로그인 및 회의 생성, 참여 버튼이 있는 메인 페이지 입니다.
![Image](https://github.com/user-attachments/assets/06ca18e0-f6a0-4855-b028-8dc5d0638bb6)
#### 미유에 대한 간략한 설명이 있는 온보딩 페이지 입니다.
![Image](https://github.com/user-attachments/assets/4cb4f25d-0468-4281-86f5-8d16d47986ff)
---
![Image](https://github.com/user-attachments/assets/447f1e24-054e-414e-a7de-812e94604c54)
### 닉네임, 마이크 및 카메라 설정
#### 발표회 입장 전 닉네임, 마이크 및 카메라를 설정합니다.
![Image](https://github.com/user-attachments/assets/afc7c29b-7778-409a-94a5-2dfb2ec7fd4d)
### 발표회 설정
#### 발표회의 1인당 발표, 질의응답 시간을 설정합니다.
![Image](https://github.com/user-attachments/assets/23f591e0-6a9d-4035-8f47-b6cbd24573ef)
#### 발표 순서를 설정합니다. 정해진 순서가 있다면 그 순서대로 진행할 수 있고, 랜덤 순서 또한 가능합니다.
![Image](https://github.com/user-attachments/assets/1015c4d6-2147-47df-8c95-da72a0f53566)
### 발표 내용 요약
#### 중간 발표 내용의 요약 및 추천 질문이 채팅창에 나타납니다.
![Image](https://github.com/user-attachments/assets/ad0e6ae1-b4ce-4bf9-bca5-4538e6ae64b9)
### 질의 응답
#### 질의 응답이 시작되면 손들기 버튼을 눌러 질문할 수 있습니다.
![Image](https://github.com/user-attachments/assets/04ebe2b8-39a3-40ca-8b27-72924be362b0)
### 최종 요약 저장
#### 발표회가 종료된 후, 최종 요약본이 보관함 페이지에 저장됩니다. 요약본은 Notion과 PDF로 제공됩니다.
![Image](https://github.com/user-attachments/assets/08fc54a1-4b59-45de-8414-83b023cf1c8f)

## ✨ 주요 기능
- `AI 사회자`
    - AI 미유가 발표회의 시작부터 종료까지 진행
- `실시간 스크립트`
    - 발표 내용 실시간 스크립트 제공
- `요약 및 추천 질문`
    - 발표자가 발표 종료 시, 해당 발표에 대한 요약과 추천 질문 제공
- `요약본`
    - 발표회 종료 후, 모든 발표자에 대한 발표 및 질의 응답 내용이 로그인 된 참여자의 보관함에 저장.
    - 요약본은 Notion 페이지에  추가하거나 PDF로 다운로드 가능

## 🖥️ 개발 환경
| **분야**           | **기술**          |
|------------------|------------------|
| **프로그래밍 언어** | TypeScript, Java |
| **프레임워크**     | FE: React, Redux <br> BE: Spring, Spring Boot |
| **데이터베이스**   | MySQL            |
| **버전 관리**     | Git              |
| **클라우드**      | AWS              |
| **배포 도구**     | Docker, Jenkins  |
| **테스트 프레임워크** | Jest          |
| **API**          | RESTful API      |

<h2 id="시스템-아키텍처">🫧 시스템 아키텍처</h2>

![Image](https://github.com/user-attachments/assets/ee7f0c11-11c8-4765-9816-92dd5b796b04)


<h2 id="ERD">⛅ ERD</h2>

![Image](https://github.com/user-attachments/assets/d8bb1431-b577-4317-ae46-7ca9f8ba42ce)

<h2 id="구성원">🙋🏻🙋🏻‍♀️ 구성원</h2>

| 김선주 | 김민재 | 배지해 | 이송희 | 제동균 | 하시윤 |
|:---:|:---:|:---:|:---:|:---:|:---:|
|![Image](https://github.com/user-attachments/assets/113394aa-f875-49cb-8257-180a39a36df3)|![Image](https://github.com/user-attachments/assets/96f08f41-2d76-4143-bdf6-de8acefab6ae)|![Image](https://github.com/user-attachments/assets/4546914a-61f0-4da7-89ef-d537268d7a88)|![Image](https://github.com/user-attachments/assets/31299ec3-23c8-4ddb-ba70-10c0025d7e67)|![Image](https://github.com/user-attachments/assets/bcfa611c-d802-4bb6-9041-924a793a74fd)|![Image](https://github.com/user-attachments/assets/2ca06b89-5d46-4d48-8029-129cd7d9c825)|

### 팀원 역할

- **김선주 (BE 팀장)**
    - 서비스 API 구현
    - CI/CD
    - OpenVidu
    - Notion / PDF 다운로드
- **김민재**
    - 서비스 API 구현
    - ChatGPT
    - DB
- **배지해**
    - UI/UX 디자인 총괄
    - Oauth2 로그인
    - UI 페이지 구현
- **이송희**
    - UI/UX 디자인
    - OpenVidu 구현
    - STT 스크립트 개발
- **제동균 (FE 팀장)**
    - UI/UX 구현
    - OpenVidu 구현
    - TTS
- **하시윤**
    - 서비스 API 구현
    - Oauth2 로그인
    - OpenVidu(채팅)
    - STT Q&A 개발
