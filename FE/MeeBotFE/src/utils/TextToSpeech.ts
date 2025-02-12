interface SpeechControls {
  speech: SpeechSynthesisUtterance;
}

export class TextToSpeech {
  private controls: SpeechControls;
  public onEnd: (() => void) | null = null;

  constructor() {
    this.controls = {
      speech: new SpeechSynthesisUtterance(),
    };

    // 기본 설정
    this.controls.speech.lang = "ko-KR";
    this.controls.speech.volume = 1;
    this.controls.speech.rate = 1;
    this.controls.speech.pitch = 1;

    // onend 이벤트 핸들러 설정
    this.controls.speech.onend = () => {
      if (this.onEnd) {
        this.onEnd();
      }
    };

    this.initializeVoice();
  }

  private initializeVoice(): void {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((voice) => voice.name === "Microsoft Heami - Korean (Korean)");
      if (koreanVoice) {
        this.controls.speech.voice = koreanVoice;
      }
    };
  }

  public speak(text: string): void {
    this.controls.speech.text = text;
    window.speechSynthesis.speak(this.controls.speech);
  }
}
