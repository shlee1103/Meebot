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
      const isExists = state.messages.some(msg =>
        msg.text === action.payload.text &&
        msg.sender === action.payload.sender &&
        msg.timestamp === action.payload.timestamp
      );

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

export const { toggleCamera, toggleMic, turnOnMic, turnOffMic } = deviceSlice.actions;

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

interface meetingSettingState {
  meetingSettingOpenModal: boolean;
}

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

// Store 설정 수정
export const store = configureStore({
  reducer: {
    myUsername: (state, action) => {
      if (action.type === resetStore.type) {
        return initialMyUsernameState;
      }
      return myUsernameSlice.reducer(state, action);
    },
    role: (state, action) => {
      if (action.type === resetStore.type) {
        return initialUserRoleState;
      }
      return userRoleSlice.reducer(state, action);
    },
    presentation: (state, action) => {
      if (action.type === resetStore.type) {
        return initialPresentationState;
      }
      return presentationSlice.reducer(state, action);
    },
    device: (state, action) => {
      if (action.type === resetStore.type) {
        return initialDeviceState;
      }
      return deviceSlice.reducer(state, action);
    },
    meetingTitle: (state, action) => {
      if (action.type === resetStore.type) {
        return initialMeetingTitleState;
      }
      return meetingTitleSlice.reducer(state, action);
    },
    qna: (state, action) => {
      if (action.type === resetStore.type) {
        return initialQnAState;
      }
      return qnaSlice.reducer(state, action);
    },
    raisedHands: (state, action) => {
      if (action.type === resetStore.type) {
        return initialRaisedHandsState;
      }
      return raisedHandsSlice.reducer(state, action);
    },
    meetingSetting: (state, action) => {
      if (action.type === resetStore.type) {
        return { meetingSettingOpenModal: false };
      }
      return meetingSettingSlice.reducer(state, action);
    },
  },
});

export interface RootState {
  myUsername: MyUsernameState;
  role: UserRoleState;
  presentation: PresentationState;
  device: DeviceState;
  meetingTitle: meetingTitleState;
  qna: QnAState;
  raisedHands: RaisedHandsState;
  meetingSetting: meetingSettingState;
}

export type AppDispatch = typeof store.dispatch;

export default store;

