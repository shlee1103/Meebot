import { useRef, useEffect } from "react";
import { H2, P } from "../common/Typography";

interface FeatureCardProps {
  title: string;
  description: {
    lines: string[];
  };
  image: string;
  imagePosition: "left" | "right";
}

const FeatureCard = ({ title, description, image, imagePosition }: FeatureCardProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const delay = element.getAttribute('data-delay');

          if (entry.isIntersecting) {
            setTimeout(() => {
              element.classList.add('translate-x-0', 'opacity-100');
              element.classList.remove(
                imagePosition === 'right' ? '-translate-x-[100%]' : 'translate-x-[100%]',
                'opacity-0'
              );
            }, Number(delay));
          } else {
            element.classList.remove('translate-x-0', 'opacity-100');
            element.classList.add(
              imagePosition === 'right' ? '-translate-x-[100%]' : 'translate-x-[100%]',
              'opacity-0'
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    descriptionRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [imagePosition]);

  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className={`
      flex ${imagePosition === 'right' ? 'lg:flex-row' : 'lg:flex-row-reverse'}
      max-w-7xl w-full gap-8 items-center
      flex-col
    `}>
        <div className="flex-1 space-y-6">
          <div
            ref={titleRef}
            data-delay="0"
            className={`
            transform transition-all duration-700 ease-out
            ${imagePosition === 'right' ? '-translate-x-[100%]' : 'translate-x-[100%]'}
            opacity-0
          `}
          >
            <H2 className={`text-white text-center ${imagePosition === 'right' ? 'lg:text-left' : 'lg:text-right'}`}>
              {title}
            </H2>
          </div>
          <div className="space-y-2">
            {description.lines.map((line, i) => (
              <P
                key={i}
                ref={(el) => (descriptionRefs.current[i] = el)}
                data-delay={`${(i + 1) * 300}`}
                className={`
                text-gray-300 text-center
                ${imagePosition === 'right' ? 'lg:text-left' : 'lg:text-right'}
                transform transition-all duration-700 ease-out
                ${imagePosition === 'right' ? '-translate-x-[100%]' : 'translate-x-[100%]'}
                opacity-0
              `}
              >
                {line}
              </P>
            ))}
          </div>
        </div>
        <div className="flex-1 relative">
          <div
            className="absolute"
            style={{
              width: '400px',
              height: '400px',
              background: 'linear-gradient(67.52deg, rgba(108, 172, 228, 0.25) 0%, rgba(108, 172, 228, 0.25) 6.16%, rgba(109, 173, 228, 0.25) 12.31%, rgba(111, 174, 229, 0.25) 18.47%, rgba(114, 176, 229, 0.25) 24.63%, rgba(117, 179, 230, 0.25) 30.79%, rgba(121, 182, 231, 0.25) 36.94%, rgba(125, 185, 232, 0.25) 43.1%, rgba(130, 189, 234, 0.25) 49.26%, rgba(134, 192, 235, 0.25) 55.42%, rgba(138, 195, 236, 0.25) 61.57%, rgba(141, 198, 237, 0.25) 67.73%, rgba(144, 200, 237, 0.25) 73.89%, rgba(146, 201, 238, 0.25) 80.05%, rgba(147, 202, 238, 0.25) 86.2%, rgba(147, 202, 238, 0.25) 92.36%)',
              filter: 'blur(100px)',
              transform: imagePosition === 'right'
                ? 'translate(-30%, -30%)'
                : 'translate(-70%, -30%)',
              top: '50%',
              left: '50%',
              zIndex: 0,
            }}
          />
          <div className="relative z-10">
            <img
              src={image}
              alt={title}
              className="w-full h-auto max-w-lg mx-auto animate-floating"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;