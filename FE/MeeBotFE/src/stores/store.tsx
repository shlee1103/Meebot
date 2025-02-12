import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParticipantInfo } from "../openVidu/hooks/useOpenVidu";

// MyUsername Slice 정의
interface MyUsernameState {
  myUsername: string;
}

const initialMyUsernameState: MyUsernameState = {
  myUsername: "",
};

const myUsernameSlice = createSlice({
  name: "myUsername",
  initialState: initialMyUsernameState,
  reducers: {
    setMyUsername: (state, action: PayloadAction<string>) => {
      state.myUsername = action.payload;
    },
  },
});

export const { setMyUsername } = myUsernameSlice.actions;

// meetingTitle Slice 정의
interface meetingTitleState {
  meetingTitle: string;
}

const initialMeetingTitleState: meetingTitleState = {
  meetingTitle: "",
};

const meetingTitleSlice = createSlice({
  name: "meetingTitle",
  initialState: initialMeetingTitleState,
  reducers: {
    setMeetingTitle: (state, action: PayloadAction<string>) => {
      state.meetingTitle = action.payload;
    },
  },
});
export const { setMeetingTitle } = meetingTitleSlice.actions;

interface UserRoleState {
  role: "admin" | "participant" | null;
}

const initialUserRoleState: UserRoleState = {
  role: "participant",
};

const userRoleSlice = createSlice({
  name: "role",
  initialState: initialUserRoleState,
  reducers: {
    setRole: (state, action: PayloadAction<"admin" | "participant">) => {
      state.role = action.payload;
    },
  },
});

export const { setRole } = userRoleSlice.actions;

interface PresentationState {
  presentationTime: number;
  qnaTime: number;
  presentersOrder: ParticipantInfo[];
  currentPresenterIndex: number;
}

const initialPresentationState: PresentationState = {
  presentationTime: 15,
  qnaTime: 15,
  presentersOrder: [],
  currentPresenterIndex: 0,
};

const presentationSlice = createSlice({
  name: "presentation",
  initialState: initialPresentationState,
  reducers: {
    setPresentationTime: (state, action: PayloadAction<number>) => {
      state.presentationTime = action.payload;
    },
    setQnATime: (state, action: PayloadAction<number>) => {
      state.qnaTime = action.payload;
    },
    updateSpeakersOrder: (state, action: PayloadAction<ParticipantInfo[]>) => {
      state.presentersOrder = action.payload;
    },
    setCurrentPresenterIndex: (state, action: PayloadAction<number>) => {
      state.currentPresenterIndex = action.payload;
    },
    incrementPresenterIndex: (state) => {
      state.currentPresenterIndex += 1;
    },
  },
});

export const { setPresentationTime, setQnATime, updateSpeakersOrder, setCurrentPresenterIndex, incrementPresenterIndex } = presentationSlice.actions;

interface DeviceState {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
}

const initialDeviceState: DeviceState = {
  isMicEnabled: true,
  isCameraEnabled: true,
};

const deviceSlice = createSlice({
  name: "device",
  initialState: initialDeviceState,
  reducers: {
    toggleCamera: (state) => {
      state.isCameraEnabled = !state.isCameraEnabled;
    },
    toggleMic: (state) => {
      state.isMicEnabled = !state.isMicEnabled;
    },
    turnOnMic: (state) => {
      state.isMicEnabled = true;
    },
    turnOffMic: (state) => {
      state.isMicEnabled = false;
    },
  },
});

export const { toggleCamera, toggleMic, turnOnMic, turnOffMic } = deviceSlice.actions;

// Redux Store 통합
export const store = configureStore({
  reducer: {
    myUsername: myUsernameSlice.reducer,
    role: userRoleSlice.reducer,
    presentation: presentationSlice.reducer,
    device: deviceSlice.reducer,
    meetingTitle: meetingTitleSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
