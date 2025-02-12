import React, { useEffect, useState } from 'react';
import StorageListItem from './StorageListItem';
import { getStorageData } from '../../apis/storage';
import { P } from '../common/Typography';
interface StorageItem {
  roomCode: string;
  content: string;
  createdAt: string;
}

interface StorageListProps {
  className?: string;
}

const StorageList: React.FC<StorageListProps> = ({ className = '' }) => {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const data = await getStorageData();
        setStorageItems(data);
      } catch (err) {
        setError('보관함 데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch storage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageData();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').slice(0, -1);
  };

  if (isLoading) {
    return <P className="text-white text-center py-10">로딩 중...</P>;
  }

  if (error) {
    return <P className="text-red-500 text-center py-10">{error}</P>;
  }

  return (
    <div className={`h-full ${className} px-9 md:px-12 lg:px-10 py-7 md:py-10 lg:py-13`}>
      <div className="h-full overflow-y-auto overflow-x-visible custom-scrollbar">
        <div className="space-y-6 mr-4">
          {storageItems.map((item, index) => {
            return (
              <div 
                key={index}
                className="relative"
              >
                <StorageListItem
                  title={item.roomCode}
                  date={formatDate(item.createdAt)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StorageList;