pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sseon701/meebot-be"
        DOCKER_TAG = "latest"
        EC2_HOST = "3.38.98.121"
        SSH_USER = "ubuntu"
        APP_PORT = "5000"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master',
                    credentialsId: 'gitlab',
                    url: 'https://lab.ssafy.com/s12-webmobile1-sub1/S12P11D104.git'
            }
        }

        stage('Move to BE/MeeBotBE Directory') {
            steps {
                dir('BE/MeeBotBE') {
                    script {
                        sh """
                        echo "Moving to BE/MeeBotBE directory..."
                        pwd
                        ls -la
                        """
                    }
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                dir('BE/MeeBotBE') {
                    script {
                        sh """
                        chmod +x ./gradlew
                        ./gradlew clean build --no-daemon

                        echo "Building Docker Image..."
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

                        echo "Pushing Docker Image to Docker Hub..."
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OPENVIDU_URL', variable: 'OPENVIDU_URL'),
                        string(credentialsId: 'OPENVIDU_SECRET', variable: 'OPENVIDU_SECRET'),
                        string(credentialsId: 'DB_URL', variable: 'DB_URL'),
                        string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                        string(credentialsId: 'GOOGLE_CLIENT_PASSWORD', variable: 'GOOGLE_CLIENT_PASSWORD'),
                        string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET_KEY'),
                        string(credentialsId: 'CLOVA_API_KEY', variable: 'CLOVA_API_KEY'),
                        string(credentialsId: 'CLOVA_REQUEST_ID', variable: 'CLOVA_REQUEST_ID'),
                        string(credentialsId: 'APP_BASE_URL', variable: 'APP_BASE_URL'),
                        string(credentialsId: 'OPENAI_API_KEY', variable: 'OPENAI_API_KEY')
                        string(credentialsId: 'NOTION_CLIENT_ID', variable: 'NOTION_CLIENT_ID')
                        string(credentialsId: 'NOTION_CLIENT_SECRET', variable: 'NOTION_CLIENT_SECRET')
                        string(credentialsId: 'NOTION_BASE_URI', variable: 'NOTION_BASE_URI')
                    ]) {
                        sh """
                        echo "Stopping and removing existing container..."
                        docker stop meebot-be || true
                        docker rm meebot-be || true

                        echo "Pulling latest Docker image..."
                        docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}

                        echo "Running new container with environment variables..."
                        docker run -d --name meebot-be --network=host -p ${APP_PORT}:${APP_PORT} \
                        -e "OPENVIDU_URL=${OPENVIDU_URL}" \
                        -e "OPENVIDU_SECRET=${OPENVIDU_SECRET}" \
                        -e "DB_URL=${DB_URL}" \
                        -e "DB_USERNAME=${DB_USERNAME}" \
                        -e "DB_PASSWORD=${DB_PASSWORD}" \
                        -e "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
                        -e "GOOGLE_CLIENT_PASSWORD=${GOOGLE_CLIENT_PASSWORD}" \
                        -e "JWT_SECRET_KEY=${JWT_SECRET_KEY}" \
                        -e "CLOVA_API_KEY=${CLOVA_API_KEY}" \
                        -e "CLOVA_REQUEST_ID=${CLOVA_REQUEST_ID}" \
                        -e "APP_BASE_URL=${APP_BASE_URL}" \
                        -e "OPENAI_API_KEY=${OPENAI_API_KEY}" \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}

                        echo "Checking running container logs..."
                        sleep 5
                        docker logs meebot-be
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                withCredentials([
                    string(credentialsId: 'MATTERMOST_WEBHOOK_URL_BE', variable: 'WEBHOOK_BE'),
                    string(credentialsId: 'MATTERMOST_WEBHOOK_URL_FE', variable: 'WEBHOOK_FE')
                ]) {
                    env.WEBHOOK_BE = WEBHOOK_BE
                    env.WEBHOOK_FE = WEBHOOK_FE
                }

                sh '''
                curl -X POST -H "Content-Type: application/json" -d '{
                    "text": "## :backend_work: 배포 성공! 🎉\n :computer: 프로젝트: MEEBOT-BE\n:git: 브랜치: master\n🔗 <${BUILD_URL}|빌드 상세 보기>"
                }' "$WEBHOOK_BE"

                curl -X POST -H "Content-Type: application/json" -d '{
                    "text": "## :backend_work: 배포 성공! 🎉\n :computer: 프로젝트: MEEBOT-BE\n:git: 브랜치: master\n🔗 <${BUILD_URL}|빌드 상세 보기>"
                }' "$WEBHOOK_FE"
                '''
            }
        }
        failure {
            script {
                withCredentials([
                    string(credentialsId: 'MATTERMOST_WEBHOOK_URL_BE', variable: 'WEBHOOK_BE'),
                    string(credentialsId: 'MATTERMOST_WEBHOOK_URL_FE', variable: 'WEBHOOK_FE')
                ]) {
                    env.WEBHOOK_BE = WEBHOOK_BE
                    env.WEBHOOK_FE = WEBHOOK_FE
                }

                sh '''
                curl -X POST -H "Content-Type: application/json" -d '{
                    "text": "### :sad-shin-chang: 배포 실패! 🚨\n:backend_work: 프로젝트: MEEBOT-BE\n:git: 브랜치: master\n🔗 <${BUILD_URL}|빌드 상세 보기> \n@sunju701"
                }' "$WEBHOOK_BE"

                curl -X POST -H "Content-Type: application/json" -d '{
                    "text": "### :sad-shin-chang: 배포 실패! 🚨\n:backend_work: 프로젝트: MEEBOT-BE\n:git: 브랜치: master\n🔗 <${BUILD_URL}|빌드 상세 보기> \n@sunju701"
                }' "$WEBHOOK_FE"
                '''
            }
        }
    }
}