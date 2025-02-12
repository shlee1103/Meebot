import { useEffect, useState } from "react";
import apiClient from "../apis/apiClient";

const useAuth = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setAccessToken(token);
  }, []);

  const logout = async () => {
    try {
      await apiClient.post("api/v1/logout", {});
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      localStorage.clear();
      setAccessToken(null);
      window.location.href = '/';
    }
  };

  return {
    accessToken,
    logout,
  }
};

export default useAuth;
