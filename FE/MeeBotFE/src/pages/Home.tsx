import { useEffect } from 'react';
import MainSection from '../components/home/MainSession';
import Footer from '../components/common/Footer';

const Home = () => {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 헤더가 보이면 Features를 상단으로
      if (scrollPosition <= 0) {
        const featuresContainer = document.querySelector('.feature-section');
        featuresContainer?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      // 푸터가 보이면 Features를 하단으로 
      if (scrollPosition + windowHeight >= documentHeight) {
        const featuresContainer = document.querySelector('.feature-section');
        featuresContainer?.scrollTo({
          top: featuresContainer.scrollHeight,
          behavior: 'smooth'
        });
      }

      // 스크롤 다운
      if (scrollPosition < windowHeight && event.deltaY > 0) {
        window.scrollTo({
          top: windowHeight,
          behavior: 'smooth'
        });
      }

      // 스크롤 업
      if (scrollPosition >= documentHeight - windowHeight * 2 && event.deltaY < 0) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="bg-[#171F2E] min-h-screen overflow-hidden">
      <MainSection />
      <Footer />
    </div>
  );
};

export default Home;