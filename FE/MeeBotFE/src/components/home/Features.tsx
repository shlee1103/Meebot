import { useEffect } from "react";
import FeatureCard from "./FeatureCard";
import feature1 from '../../assets/features/feature-1.png'
import feature2 from '../../assets/features/feature-2.png'
import feature3 from '../../assets/features/feature-3.png'
import { H1, H3, P } from "../common/Typography";

interface FeatureProps {
  title: string;
  description: {
    lines: string[];
  };
  image: string;
  imagePosition: "left" | "right";
}

const Features = () => {
  useEffect(() => {
    const container = document.querySelector('.features-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'header' && entry.isIntersecting) {
            container?.scrollTo({ top: 0, behavior: 'smooth' });
          }
          if (entry.target.id === 'footer' && entry.isIntersecting) {
            container?.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const header = document.querySelector('#header');
    const footer = document.querySelector('#footer');
    if (header) observer.observe(header);
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const features: FeatureProps[] = [
    {
      title: "실시간으로 볼 수 있는 발표",
      description: {
        lines: [
          "실시간으로 제공되는 스크립트로 모든 참여자가",
          "발표 내용을 꼼꼼히 확인할 수 있어요.",
          "중요한 순간을 놓치지 않도록 도와드립니다."
        ]
      },
      image: feature1,
      imagePosition: "left",
    },
    {
      title: "한 눈에 보는 발표 요약",
      description: {
        lines: [
          "AI 사회자 MeeU가 발표의 내용을 정리해드려요.",
          "핵심 포인트와 주요 메세지를",
          "한 눈에 볼 수 있도록 제공해드립니다."
        ]
      },
      image: feature2,
      imagePosition: "right",
    },
    {
      title: "스마트한 질문 추천",
      description: {
        lines: [
          "MeeU가 발표 내용을 기반으로 질문을 추천해드려요.",
          "자유로운 질문과 AI 추천 질문을 통해",
          "더욱 풍부한 질의응답 시간을 만들어보세요."
        ]
      },
      image: feature3,
      imagePosition: "left",
    },
  ];

  return (
    <div className="features-section h-screen overflow-x-hidden scrollbar-hide snap-y snap-mandatory">
      {features.map((feature, index) => (
        <div
          key={index}
          className="snap-start h-screen w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          <FeatureCard {...feature} />
        </div>
      ))}
      <div className="snap-start h-screen w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl mx-auto bg-white/[0.03] backdrop-blur-sm rounded-3xl p-12 border border-white/[0.05]">
            <div className="flex flex-col items-center gap-12">
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1AEBB8] animate-blink" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium tracking-wide">Ready to Start</span>
                </div>
                <H3 className="text-white">
                  AI 기반 발표 플랫폼
                </H3>
                <H1 className="font-stunning block mt-2 bg-gradient-to-r from-[#1AEBB8] to-[#6CACEE] bg-clip-text text-transparent">
                  MeeBot
                </H1>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group relative w-full sm:w-auto"
              >
                <div className="relative flex items-center justify-center gap-2
                  px-6 py-3 sm:px-10 sm:py-4 rounded-2xl
                  bg-gradient-to-r from-[#9358F7] via-[#4A9FEB] to-[#10D7E2]
                  hover:shadow-lg hover:scale-[1.02]
                  transition-all duration-300"
                >
                  <P className="text-white">
                    시작하기
                  </P>
                  <svg
                    className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#1AEBB8] to-[#6CACEE] rounded-2xl blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;