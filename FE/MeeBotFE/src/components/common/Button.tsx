import React from "react";
import { ButtonVariant } from "./ButtonTypes";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  color?: string;
}

const variantStyles = {
  glow: `
    inline-flex whitespace-nowrap w-fit
    bg-gradient-to-r from-[#9358F7] via-[#4A9FEB] to-[#10D7E2]
    hover:shadow-lg hover:scale-[1.02]
    transition-all duration-300 ease-in-out
    px-7 py-3 rounded-[10px] font-pretendard 
    text-sm-sm md:text-sm-md lg:text-sm-lg text-white
    hover:animate-pulse
  `,
  login: `
    relative flex items-center justify-center px-11 py-3 rounded-full
    cursor-pointer border-none text-white font-pretendard 
    text-sm-sm md:text-sm-md lg:text-sm-lg 
    before:content-[''] before:absolute before:-inset-[5px] before:-z-[1]
    before:bg-gradient-to-r before:from-[#03a9f4] before:via-[#f441a5] before:to-[#ffeb3b] before:to-[#03a9f4]
    before:bg-[length:300%] before:rounded-[35px] before:opacity-0
    before:transition-all before:duration-500 before:ease-in-out
    hover:before:opacity-100 hover:before:blur-xl hover:before:animate-[gradient_8s_linear_infinite]
    after:content-[''] after:absolute after:inset-0 after:z-[-2]
    after:bg-gradient-to-r after:from-[#03a9f4] after:via-[#f441a5] after:to-[#ffeb3b] after:to-[#03a9f4]
    after:bg-[length:300%] after:rounded-full after:opacity-0
    after:transition-all after:duration-500 after:ease-in-out
    hover:after:opacity-100 hover:after:animate-[gradient_8s_linear_infinite] hover:bg-transparent 
    hover:scale-105
  `,
  cancel: `
    inline-flex whitespace-nowrap w-fit
    transition-all duration-300 ease-in-out
    px-7 py-3 rounded-[10px] font-pretendard
    text-sm-sm md:text-sm-md lg:text-sm-lg
    bg-[#323945] text-white
    hover:scale-[1.02] hover:brightness-110
  `,
  normal: `
    inline-flex whitespace-nowrap w-fit
    transition-all duration-300 ease-in-out
    px-7 py-3 rounded-[10px] font-pretendard
    text-sm-sm md:text-sm-md lg:text-sm-lg text-white
    hover:shadow-md hover:scale-[1.02]
    hover:backdrop-brightness-125
    active:scale-95
  `,
  control: `
    inline-flex whitespace-nowrap
    py-4 rounded-[18px]
    font-pretendard text-p-sm md:text-p-md lg:text-p-lg 
    bg-[#323945]
  `
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = 'filled',
  icon,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex justify-center items-center gap-1
        disabled:cursor-not-allowed
        ${variantStyles[variant as keyof typeof variantStyles]}
        ${className}
      `.trim()}
    >
      {icon && (
        <span>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;