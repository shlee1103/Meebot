import { useEffect, useState } from "react";
import { Session } from "openvidu-browser";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"


const formatDate = (date:Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const usePresentationControls = (session: Session | undefined, myUserName: string) => {
    const [isPresenting, setIsPresenting] = useState<boolean>(false);
    const [currentPresenter, setCurrentPresenter] = useState<string | null>(null);
    const [currentScript, setCurrentScript] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const { transcript, resetTranscript } = useSpeechRecognition();
    
 
    // 발표 시작 버튼 눌렀을 때
    const startPresenting = () => {
        session?.signal({
            data: JSON.stringify({
                presenter: myUserName,
                action: 'start'
            }),
            type: 'presentation-status'
        });

        setStartTime(formatDate(new Date()))
    }

    // 발표 중지 버튼 눌렀을 때
    const stopPresenting = () => {
        session?.signal({
            data: JSON.stringify({
                presenter: null,
                action: 'end'
            }),
            type: 'presentation-status'
        });

        sendJSONToServer(currentPresenter, session?.sessionId)

    }

    // 발표자 null로 리셋
    const resetPresenter = () => {
        setCurrentPresenter(null)
    }

    const sendJSONToServer = (presenter: string | null, sessionId?: string) => {
        if(!presenter || !sessionId) return

        const presentationJson = {
            presenter: presenter,
            sessionId: sessionId,
            startTime: startTime,
            endTime: formatDate(new Date()),
            transcripts: currentScript
        };

        // 파일명 생성: "presentation_발표자명_타임스탬프.json"
        const fileName = `presentation_${presenter}_${new Date().getTime()}.json`;
        // JSON 데이터 생성
        const json = JSON.stringify(presentationJson, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        // 다운로드 링크 생성 및 실행
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        // 다운로드 트리거 및 정리
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }


    // 말하는 내용 전송
    const sendCurrentSpeach = (currentText: string) => {
        session?.signal({
            data: JSON.stringify({
                text: currentText,
                presenter: myUserName
            }),
            type: 'stt-transcript'
        });
    }
    

    useEffect(() => {
        if (isPresenting && transcript) {
            const currentText = transcript.trim();
            console.log(transcript)
            
            if (currentText) {              
                sendCurrentSpeach(currentText);
            }
        }
        }, [transcript, isPresenting]);
      
        useEffect(() => {
          // 발표 모드가 시작되면 음성 인식 시작
          if (isPresenting) {
              SpeechRecognition.startListening({ 
                  continuous: true,   // 계속 인식
                  language: 'ko-KR',  // 한국어
                  interimResults: true  // 중간 결과 사용
              });
          } else {
              // 발표 모드 종료되면 음성 인식 중지
              SpeechRecognition.stopListening();
              sendCurrentSpeach('');
              resetTranscript();  // 기존 transcript 초기화
          }
          
          // 컴포넌트 언마운트 시 정리
          return () => {
              SpeechRecognition.stopListening();
          };
      
      }, [isPresenting,resetTranscript]);
    
    return {
        isPresenting,
        setIsPresenting,
        startPresenting,
        stopPresenting,
        currentPresenter,
        setCurrentPresenter,
        resetPresenter,
        currentScript,
        setCurrentScript,
        sendJSONToServer
    }
}
