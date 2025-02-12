import React, { useState, useRef, useEffect } from 'react';
import DownloadIcon from '../../assets/download_icon.svg';
import NotionIcon from '../../assets/notion_icon.svg';
import TrashIcon from '../../assets/trash_icon.svg';
import PdfIcon from '../../assets/pdf_icon.png';
import { Mn, P } from '../common/Typography';
import DeleteConfirmPopup from './Popup/DeleteConfirmPopup';
import SaveCompletePopup from './Popup/SaveCompletePopup';
import { deleteStorageData } from '../../apis/storage';

interface StorageItemProps {
  title: string;
  date: string;
}

const StorageListItem: React.FC<StorageItemProps> = ({ title, date }) => {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveComplete, setShowSaveComplete] = useState(false);
  const [saveType, setSaveType] = useState<'notion' | 'pdf'>('notion');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadClick = (type: 'notion' | 'pdf') => {
    setShowDownloadOptions(false);
    setSaveType(type);
    console.log(`Downloading as ${type}`);
    setShowSaveComplete(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      const data = await deleteStorageData(title);
      console.log(data);
    } catch (err) {
      console.error('Failed to delete storage item:', err);
    }
  };

  return (
    <>
      <div className="
        relative flex flex-row flex-wrap justify-between items-center py-4 px-6 w-full rounded-[15px] bg-gradient-to-r 
        from-[rgba(255,255,255,0.3)] via-[rgba(204,204,204,0.6)] via-[rgba(145,161,181,0.825)] to-[rgba(89,110,137,0.6)]"
      >
        <div className="flex flex-col justify-center items-start gap-2">
          <P className="text-white !font-bold">{title}</P>
          <Mn className="text-[#E9E9E9] !font-medium">{date}</Mn>
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex justify-center items-center cursor-pointer p-2 hover:scale-110 transition-all duration-200 rounded-full hover:bg-white/10"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            >
              <img
                src={DownloadIcon}
                alt="download"
                className="w-[25px] h-[29px]"
              />
            </div>
            {showDownloadOptions && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1C2135] rounded-lg shadow-lg border border-[#464E62] overflow-hidden z-[1]">
                <div
                  className="px-5 py-3 hover:bg-[#2C3440] cursor-pointer transition-colors flex items-center gap-3 border-b border-[#464E62] group"
                  onClick={() => handleDownloadClick('notion')}
                >
                  <img
                    src={NotionIcon}
                    alt="Notion"
                    className="w-5 h-5 group-hover:animate-bounce"
                  />
                  <span className="text-white font-pretendard text-sm whitespace-nowrap">Notion으로 저장</span>
                </div>
                <div
                  className="px-5 py-3 hover:bg-[#2C3440] cursor-pointer transition-colors flex items-center gap-3 group"
                  onClick={() => handleDownloadClick('pdf')}
                >
                  <img
                    src={PdfIcon}
                    alt="PDF"
                    className="w-5 h-5 group-hover:animate-bounce"
                  />
                  <span className="text-white font-pretendard text-sm whitespace-nowrap">PDF로 저장</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center cursor-pointer p-2 hover:scale-110 transition-all duration-200 rounded-full hover:bg-white/10"
            onClick={handleDeleteClick}>
            <img
              src={TrashIcon}
              alt="trash"
              className="w-[25px] h-[25px]"
            />
          </div>
        </div>
      </div>
      <DeleteConfirmPopup
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
      <SaveCompletePopup
        isOpen={showSaveComplete}
        onClose={() => setShowSaveComplete(false)}
        type={saveType}
      />
    </>
  );
};

export default StorageListItem;