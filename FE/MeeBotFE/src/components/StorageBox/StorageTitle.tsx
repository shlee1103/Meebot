import React from 'react'
import { H2, Sm } from '../common/Typography';

interface StorageTitleProps {
  className?: string;
}

const StorageTitle: React.FC<StorageTitleProps> = ({ className = '' }) => {
  return (
    <div className={`px-9 md:px-12 lg:px-15 py-7 md:py-10 lg:py-13 ${className}`}>
      <div className='flex flex-col gap-5'>
        <H2 className='text-white'>보관함</H2>
        <Sm className='text-white'>지난 발표 내용의 요약문을 저장하세요.</Sm>
      </div>
    </div>
  )
}
export default StorageTitle