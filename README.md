# MeeBot

### 📜 Contents
 1. [소개](#-소개)
 2. [서비스 화면](#-서비스-화면)
 3. [주요 기능](#-주요-기능)
 4. [개발 환경](#%EF%B8%8F-개발-환경)
 5. [시스템 아키텍처](#-시스템-아키텍처)
 6. [기술 특이점](#-기술-특이점)
 7. [기획 및 설계 산출물](#-기획-및-설계-산출물)
 8. [Conventions](#-conventions)
 9. [팀원 소개](#-팀원-소개)

## 🤍 소개
<b>AI 사회자가 진행하는 화상 회의 서비스</b>

## 서비스 화면

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

## 개발 환경
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

### 🙋🏻🙋🏻‍♀️ 구성원 


| 김선주 | 김민재 | 배지해 | 이송희 | 제동균 | 하시윤 |
|:---:|:---:|:---:|:---:|:---:|:---:|
|![Image](https://github.com/user-attachments/assets/113394aa-f875-49cb-8257-180a39a36df3)|![Image](https://github.com/user-attachments/assets/96f08f41-2d76-4143-bdf6-de8acefab6ae)|![Image](https://github.com/user-attachments/assets/4546914a-61f0-4da7-89ef-d537268d7a88)|![Image](https://github.com/user-attachments/assets/31299ec3-23c8-4ddb-ba70-10c0025d7e67)|![Image](https://github.com/user-attachments/assets/bcfa611c-d802-4bb6-9041-924a793a74fd)|![Image](https://github.com/user-attachments/assets/2ca06b89-5d46-4d48-8029-129cd7d9c825)|



<b>[1/13 ~ 1/17]</b>
| 날짜  | 전체 | 김선주 | 김민재 | 배지해 | 이송희 | 제동균 | 하시윤 |
|:-------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
| 1/13  | 프로젝트 주제 회의, <br> 컨설턴트 코치님 1차 사전 미팅 | Jira 설정 및 Gitlab 연결, <br> Jira 타임라인 작성 | Openvidu, Kurento 기술 조사 | 아이디어 구상 및 기능 정리 | 아이디어 구상 및 기능 정리, 팀 노션 세팅, AI 기술 조사 | 아이디어 구상 | 아이디어 구상 |
| 1/14  | 메인 기능 테스트 | STT API 비교, <br> Naver Clova API 테스트 | diart 활용 대화 화자 분리 테스트, 관련 서비스 조사 | Kurento 쿠렌토 공부 및 조사 diart 조사 및 연구 | WebRTC 개념 정리, Openvidu 기술 조사 | Openvidu기술 조사 | RTZR STT(whisper/sommers model) 테스트 |
| 1/15  | 컨설턴트 코치님 2차 미팅,<br> 메인 기능 테스트 | openVidu 연결 테스트 | Azure stt 기술 조사, 도커 및 CI, CD를 위한 내용 학습 | OpenVidu v.2 조사 및 공부 | openVidu 연결 테스트 및 연구 | openVidu 기능 테스트 (녹화, 화면공유) | openVidu 연결 테스트 |
| 1/16  | 세부 기능 논의 | React STT 테스트, <br> openVidu 연결 테스트 | Openvidu v2 연결 테스트 | 기능 명세서 작성 | Openvidu 기기별 음성 추출 테스트, 기능명세서 작성 | 기능 명세서 작성 | openVidu 연결 테스트, 파일 요약 및 질문 생성 테스트(Clova API) |
| 1/17  | ERD 설계, UX/UI 설계, <br> 와이어프레임 논의 |와이어프레임 논의 | ChatGPT API 활용 및 TTS 테스트 | 와이어 프레임 작성 | 와이어프레임 작성, UX/UI 설계 | 와이어프레임 작성, FE 역할 구분 | Google Cloud TTS API 테스트 |
