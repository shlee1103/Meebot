import { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export const H1 = ({ children, className = '' }: TypographyProps) => (
  <h1 className={`
    font-stunning 
    text-h1-sm md:text-h1-md lg:text-h1-lg
    ${className}
  `}>
    {children}
  </h1>
);

export const H2 = ({ children, className = '' }: TypographyProps) => (
  <h2 className={`
    font-pretendard 
    text-h2-sm md:text-h2-md lg:text-h2-lg 
    ${className}
  `}>
    {children}
  </h2>
);

export const H3 = ({ children, className = '' }: TypographyProps) => (
  <h3 className={`
    font-pretendard 
    text-h3-sm md:text-h3-md lg:text-h3-lg 
    ${className}
  `}>
    {children}
  </h3>
);

export const H4 = ({ children, className = '' }: TypographyProps) => (
  <h4 className={`
    font-pretendard 
    text-h4-sm md:text-h4-md lg:text-h4-lg  
    ${className}
  `}>
    {children}
  </h4>
);

export const Lg = ({ children, className = '' }: TypographyProps) => (
  <p className={`
    font-pretendard 
    text-lg-sm md:text-lg-md lg:text-lg-lg 
    ${className}
  `}>
    {children}
  </p>
);

export const P = ({ children, className = '' }: TypographyProps) => (
  <p className={`
    font-pretendard 
    text-p-sm md:text-p-md lg:text-p-lg 
    ${className}
  `}>
    {children}
  </p>
);

export const Sm = ({ children, className = '' }: TypographyProps) => (
  <p className={`
    font-pretendard 
    text-sm-sm md:text-sm-md lg:text-sm-lg 
    ${className}
  `}>
    {children}
  </p>
);

export const Mn = ({ children, className = '' }: TypographyProps) => (
  <p className={`
    font-pretendard 
    text-mn-sm md:text-mn-md lg:text-mn-lg 
    ${className}
  `}>
    {children}
  </p>
);