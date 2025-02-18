import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { ParticipantInfo } from "../openVidu/hooks/useOpenVidu";
import storage from "redux-persist/lib/storage";

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
const myUsernameTitlePersistConfig = {
  key: "myUsername",
  storage,
};
const persistedMyUsernameReducer = persistReducer(myUsernameTitlePersistConfig, myUsernameSlice.reducer);

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
const meetingTitlePersistConfig = {
  key: "meetingTitle",
  storage,
};
const persistedMeetingTitleReducer = persistReducer(meetingTitlePersistConfig, meetingTitleSlice.reducer);

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
const rolePersistConfig = {
  key: "role",
  storage,
};
const persistedRoleReducer = persistReducer(rolePersistConfig, userRoleSlice.reducer);

interface PresentationState {
  presentationTime: number;
  qnaTime: number;
  presentersOrder: ParticipantInfo[];
  currentPresenterIndex: number;
}

const initialPresentationState: PresentationState = {
  presentationTime: 0,
  qnaTime: 0,
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
    turnOnCamera: (state) => {
      state.isCameraEnabled = true;
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

export const { toggleCamera, turnOnCamera, toggleMic, turnOnMic, turnOffMic } = deviceSlice.actions;

const devicePersistConfig = {
  key: "device",
  storage,
};
const persistedDeviceReducer = persistReducer(devicePersistConfig, deviceSlice.reducer);

// QnA 관련 인터페이스와 slice 추가
interface QnAMessage {
  sender: string;
  text: string;
  timestamp: number;
  order: number;
}

interface QnAState {
  messages: QnAMessage[];
  globalOrder: number;
}

const initialQnAState: QnAState = {
  messages: [],
  globalOrder: 0,
};

const qnaSlice = createSlice({
  name: "qna",
  initialState: initialQnAState,
  reducers: {
    addMessage: (state, action: PayloadAction<QnAMessage>) => {
      const isExists = state.messages.some((msg) => msg.text === action.payload.text && msg.sender === action.payload.sender && msg.timestamp === action.payload.timestamp);

      if (!isExists) {
        state.messages.push(action.payload);
        state.messages.sort((a, b) => a.order - b.order);
      }
    },
    incrementGlobalOrder: (state) => {
      state.globalOrder += 1;
    },
    resetQnA: (state) => {
      state.messages = [];
      state.globalOrder = 0;
    },
  },
});

interface RaisedHandParticipant {
  connectionId: string;
  userName: string;
}

interface RaisedHandsState {
  raisedHands: RaisedHandParticipant[];
}

const initialRaisedHandsState: RaisedHandsState = {
  raisedHands: [],
};

const raisedHandsSlice = createSlice({
  name: "raisedHands",
  initialState: initialRaisedHandsState,
  reducers: {
    addRaisedHand: (state, action: PayloadAction<RaisedHandParticipant>) => {
      state.raisedHands.push(action.payload);
    },
    removeRaisedHand: (state, action: PayloadAction<string>) => {
      state.raisedHands = state.raisedHands.filter((participant) => participant.connectionId !== action.payload);
    },
    clearRaisedHands: (state) => {
      state.raisedHands = [];
    },
  },
});

export const { addRaisedHand, removeRaisedHand, clearRaisedHands } = raisedHandsSlice.actions;
export const { addMessage, incrementGlobalOrder, resetQnA } = qnaSlice.actions;

const meetingSettingSlice = createSlice({
  name: "meetingSettingOpenModal",
  initialState: {
    meetingSettingOpenModal: false,
  },
  reducers: {
    setMeetingSettingOpenModal: (state, action: PayloadAction<boolean>) => {
      state.meetingSettingOpenModal = action.payload;
    },
  },
});
export const { setMeetingSettingOpenModal } = meetingSettingSlice.actions;

// Reset Action 추가
const resetStoreAction = createSlice({
  name: "resetStore",
  initialState: {},
  reducers: {
    resetStore: () => {
      return undefined; // 이렇게 하면 모든 reducer가 자신의 initialState로 초기화됩니다
    },
  },
});

export const { resetStore } = resetStoreAction.actions;

// Redux Store 통합
export const store = configureStore({
  reducer: {
    myUsername: persistedMyUsernameReducer,
    meetingTitle: persistedMeetingTitleReducer,
    role: persistedRoleReducer,
    device: persistedDeviceReducer,
    presentation: presentationSlice.reducer,
    qna: qnaSlice.reducer,
    raisedHands: raisedHandsSlice.reducer,
    meetingSettingOpenModal: meetingSettingSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
export const persistor = persistStore(store);