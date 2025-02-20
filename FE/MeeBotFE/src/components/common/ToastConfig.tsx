import { ToastContainer, toast } from "react-toastify";
import { P } from "./Typography";
import "react-toastify/dist/ReactToastify.css";

interface CustomToastProps {
  messageList: string[];
}

const CustomToast = ({ messageList }: CustomToastProps) => (
  <div className="flex items-center gap-4 w-fit px-3">
    <div className="flex-shrink-0">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#FF0000" />
        <path d="M12 6V14M12 16V18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
    <div className="flex flex-col flex-nowrap">
      {messageList.map((message) => (
        <P className="whitespace-nowrap">{message}</P>
      ))}
    </div>
  </div>
);

export const showToast = (messageList: string[]) => {
  toast(<CustomToast messageList={messageList} />, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    closeButton: false,
    style: { width: "fit-content" },
  });
};

const ToastConfig = () => {
  return (
    <ToastContainer position="top-center" autoClose={3000} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover hideProgressBar theme="dark" closeButton={false} />
  );
};

export default ToastConfig;
