import apiClient from "./apiClient"

interface StorageItem {
  roomCode: string;
  content: string;
  createdAt: string;
}

// 보관함 데이터 가져오기
export const getStorageData = async (): Promise<StorageItem[]> => {
  const response = await apiClient.get('/api/storage')
  return response.data
}

// 보관함 데이터 삭제
export const deleteStorageData = async (roomCode: string): Promise<string> => {
  const response = await apiClient.delete(`/api/storage/${roomCode}`)
  return response.data
}