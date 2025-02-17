import Header from "../components/common/Header"
import MeetingSetup from "../components/MeetingSetting/MeetingSetup"

const MeetingSetting = () => {
  return (
    <div className="bg-[#171F2E] h-screen flex flex-col overflow-y-auto">
      <Header className="relative z-50" />
      <div className="flex-1 flex">
        <MeetingSetup className="w-full h-full" />
      </div>
    </div>
  )
}

export default MeetingSetting