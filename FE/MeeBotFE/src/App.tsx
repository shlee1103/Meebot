import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './stores/store';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import MeetingSetting from './pages/MeetingSetting';
import VideoConference from "./openVidu/pages/VideoConference";

const App = () => {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/meeting-setting/:sessionId" element={<MeetingSetting />} />
        <Route path="/video-conference/:sessionId/:myUserName" element={<VideoConference />} />
      </Routes>
    </Provider>
  );
};

export default App;
