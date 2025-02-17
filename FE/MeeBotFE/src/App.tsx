import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./stores/store";
import { PersistGate } from "redux-persist/integration/react";
import Home from "./pages/Home";
import OAuthCallback from "./pages/OAuthCallback";
import MeetingSetting from "./pages/MeetingSetting";
import VideoConference from "./openVidu/pages/VideoConference";
import ToastConfig from "./components/common/ToastConfig";
import StorageBox from "./pages/StorageBox";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/meeting-setting/:sessionId" element={<MeetingSetting />} />
          <Route path="/video-conference/:sessionId/:myUserName" element={<VideoConference />} />
          <Route path="/storage-box" element={<StorageBox />} />
        </Routes>
        <ToastConfig />
      </PersistGate>
    </Provider>
  );
};

export default App;
