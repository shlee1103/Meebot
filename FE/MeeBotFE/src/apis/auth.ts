import apiClient from "./apiClient";

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

// 로그인 요청
export const login = async (): Promise<string> => {
  const { data } = await apiClient.post<{ url: string }>('api/v1/oauth2/google')
  return data.url
}

// 로그아웃 요청
export const logout = async (): Promise<void> => {
  await apiClient.post('api/v1/oauth2/logout')
  localStorage.clear()
}

// access token 재발급 요청
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const { data } = await apiClient.post<Tokens>('api/v1/oauth2/refresh', {}, {
    headers: {'Refresh-Token': refreshToken},
  })
  localStorage.setItem('access_token', data.access_token)
  return data.access_token
}