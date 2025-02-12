interface FeatureCardProps {
  title: string;
  description: {
    lines: string[];
  };
  image: string;
  imagePosition: "left" | "right";
}

const FeatureCard = ({ title, description, image, imagePosition }: FeatureCardProps) => {
  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className={`
        flex ${imagePosition === 'right' ? 'flex-row' : 'flex-row-reverse'}
        max-w-7xl w-full gap-8 items-center
        flex-col lg:flex-row
      `}>
        <div className="flex-1 space-y-6">
          <h2 className="font-pretendard font-h2 text-h2-sm md:text-h2-md lg:text-h2-lg text-white">
            {title}
          </h2>
          <div className="space-y-2">
            {description.lines.map((line, i) => (
              <p key={i} className="font-pretendard font-paragraph text-paragraph-sm md:text-paragraph-md lg:text-paragraph-lg text-white">
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <img
            src={image}
            alt={title}
            className="w-full h-auto max-w-lg mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;