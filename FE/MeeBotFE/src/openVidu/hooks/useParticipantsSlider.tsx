import { useState } from "react";
import { Subscriber } from "openvidu-browser";

export const useParticipantsSlider = (subscribers: Subscriber[], isMenuOpen: boolean) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const handlePrevSlide = () => {
    console.log("이전 버튼 클릭");
    setCurrentSlide((curr) => Math.max(0, curr - 1));
  };

  const handleNextSlide = () => {
    console.log("다음 버튼 클릭");
    setCurrentSlide((curr) => Math.min(curr + 1, Math.max(0, subscribers.length - (isMenuOpen ? 4 : 6))));
  };

  return {
    currentSlide,
    handlePrevSlide,
    handleNextSlide,
  };
};
