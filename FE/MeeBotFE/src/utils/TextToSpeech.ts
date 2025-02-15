export class TextToSpeech {
  private audioContext: AudioContext;
  public onEnd: (() => void) | null = null;
  public onTextChange: ((text: string) => void) | null = null;
  private readonly API_KEY = "여기는 API키 채워주세요";
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new AudioContext();
  }

  private splitIntoSentences(text: string): string[] {
    // 문장의 시작과 끝을 포함하는 더 정확한 패턴
    const sentencePatterns = [
      // 일반적인 문장 부호로 끝나는 경우
      /[^.!?]+[.!?]+/g,

      // 한국어 종결어미로 끝나는 완전한 문장
      /[^.!?]+(?:습니다|습니까|세요|해요|됩니다|입니다|합니다|드립니다)(?![가-힣])/g,
    ];

    // 시작 전 쉼표 처리: 쉼표는 문장을 나누는 기준이 되지 않도록 함
    text = text.replace(/\s*,\s*/g, ", ");

    // 각 패턴으로 매칭되는 문장들을 찾음
    let sentences: string[] = [];
    let remainingText = text;

    sentencePatterns.forEach((pattern) => {
      const matches = remainingText.match(pattern);
      if (matches) {
        sentences = sentences.concat(matches);
        // 매칭된 부분을 제거
        matches.forEach((match) => {
          remainingText = remainingText.replace(match, "");
        });
      }
    });

    // 남은 텍스트가 있다면 마지막 문장으로 추가
    if (remainingText.trim()) {
      sentences.push(remainingText.trim());
    }

    // 중복 제거 및 공백 처리
    return [...new Set(sentences)].map((s) => s.trim()).filter((s) => s.length > 0);
  }

  private async synthesizeSpeech(text: string): Promise<AudioBuffer> {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "ko-KR",
          name: "ko-KR-Neural2-A",
        },
        audioConfig: {
          audioEncoding: "LINEAR16",
          pitch: 0,
          speakingRate: 1.0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to synthesize speech");
    }

    const { audioContent } = await response.json();
    const binaryAudio = atob(audioContent);
    const audioArray = new Uint8Array(binaryAudio.length);
    for (let i = 0; i < binaryAudio.length; i++) {
      audioArray[i] = binaryAudio.charCodeAt(i);
    }

    return await this.audioContext.decodeAudioData(audioArray.buffer);
  }

  private async playSentence(audioBuffer: AudioBuffer, text: string): Promise<void> {
    return new Promise((resolve) => {
      const source = this.audioContext.createBufferSource();
      this.currentSource = source;
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      if (this.onTextChange) {
        this.onTextChange(text);
      }

      source.onended = () => {
        this.currentSource = null;
        resolve();
      };

      source.start(0);
    });
  }

  public async speak(text: string): Promise<void> {
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;
      const sentences = this.splitIntoSentences(text);

      for (const sentence of sentences) {
        if (!this.isPlaying) break;

        const audioBuffer = await this.synthesizeSpeech(sentence);
        await this.playSentence(audioBuffer, sentence);
      }

      if (this.onEnd) {
        this.onEnd();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    } finally {
      this.isPlaying = false;
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (error) {
        console.error("Error stopping audio source:", error);
      }
      this.currentSource = null;
    }
    if (this.onTextChange) {
      this.onTextChange("");
    }
  }

  public async close(): Promise<void> {
    this.stop();
    if (this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.error("Error closing audio context:", error);
      }
    }
  }
}
