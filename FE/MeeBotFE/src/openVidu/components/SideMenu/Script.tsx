

interface ScriptProps {
  isPresenting: boolean
  currentScript: string
  currentPresenter: string | null
}

const Script: React.FC<ScriptProps> = ({isPresenting, currentScript, currentPresenter}) => {
 

  // 실시간 스크립트 표시
  return (
    <>
      {(isPresenting || currentPresenter) && (
        <div className="p-4 overflow-y-auto h-full">
            <div className="p-3 rounded-lg bg-[#E9E8F3] bg-opacity-30 text-[#FFFFFF] text-sm">
              {currentScript}
            </div>
        </div>
      )}
    </>
  );
};

export default Script;
