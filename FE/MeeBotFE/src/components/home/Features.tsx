import { useEffect } from "react";
import FeatureCard from "./FeatureCard";
import feature1 from '../../assets/features/feature-1.png'
import feature2 from '../../assets/features/feature-2.png'
import feature3 from '../../assets/features/feature-3.png'

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
    <div className="features-section h-screen overflow-x-hidden scrollbar-hide">
      {features.map((feature, index) => (
        <div
          key={index}
          className="snap-start h-screen w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          <FeatureCard {...feature} />
        </div>
      ))}
    </div>
  );
};

export default Features;