import { useEffect, useRef } from "react";
import MainSection from "../components/home/MainSession";
import Footer from "../components/common/Footer";
import BackgroundGradients from "../components/common/BackgroundGradients";
import { useDispatch } from "react-redux";
import { setMeetingTitle, setMyUsername, setRole, turnOnCamera, turnOnMic } from "../stores/store";

const Home = () => {
  const lastScrollTime = useRef(Date.now());

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastScrollTime.current < 500) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const featuresContainer = document.querySelector(".features-section");

      if (scrollPosition < windowHeight && event.deltaY > 0) {
        window.scrollTo({
          top: windowHeight,
          behavior: "smooth",
        });
        lastScrollTime.current = currentTime;
        return;
      }

      if (scrollPosition >= windowHeight && event.deltaY < 0) {
        const featuresScroll = featuresContainer?.scrollTop || 0;
        if (featuresScroll === 0) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          lastScrollTime.current = currentTime;
          return;
        }
      }

      if (featuresContainer && event.deltaY > 0) {
        const featuresScroll = featuresContainer.scrollTop;
        const featuresScrollHeight = featuresContainer.scrollHeight;
        const featuresClientHeight = featuresContainer.clientHeight;

        if (Math.abs(featuresScroll + featuresClientHeight - featuresScrollHeight) < 10) {
          window.scrollTo({
            top: documentHeight,
            behavior: "smooth",
          });
          lastScrollTime.current = currentTime;
          return;
        }
      }

      if (scrollPosition + windowHeight >= documentHeight && event.deltaY < 0) {
        window.scrollTo({
          top: windowHeight,
          behavior: "smooth",
        });
        if (featuresContainer) {
          featuresContainer.scrollTo({
            top: featuresContainer.scrollHeight - featuresContainer.clientHeight,
            behavior: "smooth",
          });
        }
        lastScrollTime.current = currentTime;
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const dispatch = useDispatch();

  // 전역 스토어 + localStorage초기화
  useEffect(() => {
    dispatch(setMyUsername(""));
    dispatch(setRole("participant"));
    dispatch(setMeetingTitle(""));
    dispatch(turnOnCamera());
    dispatch(turnOnMic());
  }, []);

  return (
    <div className="bg-[#171F2E] min-h-screen overflow-hidden">
      <BackgroundGradients />
      <MainSection />
      <Footer />
    </div>
  );
};

export default Home;
