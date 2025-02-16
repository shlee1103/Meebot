import apiClient from "./apiClient";

export interface StorageItem {
  roomTitle: string;
  roomCode: string;
  content: string;
  createdAt: string;
}

// 보관함 데이터 가져오기
export const getStorageData = async (): Promise<StorageItem[]> => {
  const response = await apiClient.get("/api/storage");
  return response.data;
};

// 보관함 데이터 삭제
export const deleteStorageData = async (roomCode: string): Promise<string> => {
  const response = await apiClient.delete(`/api/storage/${roomCode}`);
  return response.data;
};

// 보관함 데이터 노션으로 다운
export const saveNotion = async (roomCode: string): Promise<string> => {
  const response = await apiClient.get(`/api/download/login`, {
    data: { room_code: roomCode },
  });
  return response.data;
};

// 보관함 데이터 pdf로 다운
export const savePdf = async (roomCode: string): Promise<string> => {
  const response = await apiClient.get(`/api/download/pdf`, {
    data: { room_code: roomCode },
  });
  return response.data;
}

// 최종 요약본 저장
export const saveSummary = async (roomCode: string): Promise<string> => {
  const response = await apiClient.post(`/api/chatgpt/final-summarize`, { roomCode: roomCode });
  return response.data;
};