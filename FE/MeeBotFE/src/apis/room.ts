import apiClient from "./apiClient"

// 새로운 방 생성
export const createRoom = async (roomCode: string, roomTitle: string, hostEmail: string): Promise<void> => {
  await apiClient.post('/api/rooms', { roomCode, roomTitle, hostEmail })
}

// 방 제목 변경
export const updateRoomTitle = async (roomCode: string, title: string): Promise<void> => {
  await apiClient.put(`/api/rooms/${roomCode}/title`, { title })
}

// 방 호스트 변경
export const updateRoomHost = async (roomCode: string, hostEmail: string): Promise<void> => {
  await apiClient.put(`/api/rooms/${roomCode}/host`, { hostEmail })
}

// 현재 로그인한 사용자가 참여한 모든 방 조회
export const getJoinedRooms = async (): Promise<void> => {
  const roomDatas = await apiClient.get('/api/rooms/my/rooms')
  return roomDatas.data
}

// 방 코드 발급
export const createSession = async (sessionId: string): Promise<string> => {
  const response = await apiClient.post('/api/sessions', { customSessionId: sessionId }, { headers: { "Content-Type": "application/json"}});
  return response.data;
};

// 토큰 만들기
export const createToken = async (sessionId: string): Promise<string> => {
  const response = await apiClient.post(`/api/sessions/${sessionId}/connections`, { session: sessionId }, { headers: { "Content-Type": "application/json" } });
  return response.data;
};

// 세션 ID 유효 확인
export const checkSessionId = async (sessionId: string): Promise<boolean> => {
  const response = await apiClient.get(`/api/sessions/check/${sessionId}`);
  return response.data;
}