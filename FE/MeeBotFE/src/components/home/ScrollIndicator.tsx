import { Mn } from "../common/Typography";

const ScrollIndicator = () => {
  const scrollToNextSection = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToNextSection}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white
      transition-all duration-300 pt-[60px] cursor-pointer hover:opacity-70 active:scale-95"
    >
      <span className="absolute top-0 left-1/2 w-4 h-4 -ml-3 
        border-l border-b border-white rotate-[-45deg]
        animate-[sdb_1.5s_infinite]">
      </span>
      <Mn className="!font-light">아래로 스크롤하기</Mn>
    </button>
  );
};

export default ScrollIndicator;