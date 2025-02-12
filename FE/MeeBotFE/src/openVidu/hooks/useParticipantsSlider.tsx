import { useState } from "react";
import { Subscriber } from "openvidu-browser";

export const useParticipantsSlider = (subscribers: Subscriber[], isMenuOpen: boolean) => {
  const [ currentSlide, setCurrentSlide ] = useState<number>(0);

  const handlePrevSlide = () => {
    setCurrentSlide((curr) => Math.max(0, curr - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((curr) => Math.min(curr + 1, Math.max(0, subscribers.length - (isMenuOpen ? 3 : 5))));
  };

  return {
    currentSlide,
    handlePrevSlide,
    handleNextSlide,
  };
};
