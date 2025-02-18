# 사용하는 jdk 버전
#FROM openjdk:17
#ARG JAR_FILE=build/libs/*.jar
#COPY ${JAR_FILE} app.jar
#EXPOSE 5000
#ENTRYPOINT ["java","-jar","/app.jar"]

# 사용하는 jdk 버전
FROM openjdk:17

# 폰트 디렉토리 생성
RUN mkdir -p /app/fonts

# JAR 파일과 폰트 파일 복사
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
COPY src/main/resources/fonts/malgun.ttf /app/fonts/

EXPOSE 5000
ENTRYPOINT ["java","-jar","/app.jar"]