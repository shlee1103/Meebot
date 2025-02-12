import Header from "../components/common/Header"
import StorageList from "../components/StorageBox/StorageList"
import StorageTitle from "../components/StorageBox/StorageTitle"

const StorageBox = () => {
  return (
    <div className="bg-[#171F2E] h-screen flex flex-col overflow-hidden">
      <Header className="relative z-50" />
      <div className="flex-1 flex px-6 md:px-12 lg:px-24 pb-12 md:pb-16 lg:pb-20 h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-full h-full rounded-2xl border border-white flex lg:flex-row flex-col overflow-hidden">
          <div className="lg:w-1/3 flex-shrink-0">
            <StorageTitle />
          </div>
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="lg:h-[calc(100%-104px)] lg:w-[1px] h-[1px] w-[calc(100%-104px)] bg-white"></div>
          </div>
          <div className="lg:w-2/3 flex-1 min-h-0">
            <StorageList className="h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorageBox