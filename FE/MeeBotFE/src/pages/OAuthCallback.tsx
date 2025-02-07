import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apis/apiClient';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const { data } = await apiClient.get(`/api/v1/oauth2/google?code=${code}`);

          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('email', data.userEmail);
          localStorage.setItem('name', data.name);
          localStorage.setItem('profile', data.profile);

          navigate('/')
        } catch (error) {
          console.error('OAuth 처리 실패:', error);
          alert('로그인에 실패했습니다.');
          navigate('/')
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Google 인증 중...</div>;
};

export default OAuthCallback;
