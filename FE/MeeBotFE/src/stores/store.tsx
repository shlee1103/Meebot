import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// User Role Slice 정의
interface UserRoleState {
   role: "admin" | "participant" | null;
}

const initialUserRoleState: UserRoleState = {
   role: null,
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

// Presentation Slice 정의
interface PresentationState {
   presentationTime: number;
   qnaTime: number;
   presentersOrder: string[];
}

const initialPresentationState: PresentationState = {
   presentationTime: 15,
   qnaTime: 15,
   presentersOrder: [],
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
      updateSpeakersOrder: (state, action: PayloadAction<string[]>) => {
         state.presentersOrder = action.payload;
      },
   },
});

export const { setPresentationTime, setQnATime, updateSpeakersOrder } = presentationSlice.actions;

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
   },
});

export const { toggleCamera, toggleMic } = deviceSlice.actions;

// Redux Store 통합
export const store = configureStore({
   reducer: {
      role: userRoleSlice.reducer,
      presentation: presentationSlice.reducer,
      device: deviceSlice.reducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
