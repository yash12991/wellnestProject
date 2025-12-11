import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const handleOAuthCallback = () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userString = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        setMessage('Authentication failed. Redirecting...');
        setTimeout(() => navigate('/login?error=' + error), 1500);
        return;
      }

      if (accessToken && refreshToken && userString) {
        try {
          const user = JSON.parse(userString);

          // Store tokens and user data with timestamp
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('lastLoginTime', Date.now().toString());

          console.log('✅ OAuth login successful:', user.email);
          console.log('📝 Tokens stored successfully');

          setMessage('Login successful! Redirecting...');

          // Redirect based on onboarding status
          setTimeout(() => {
            if (user.isOnboardingComplete) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          }, 1000);
        } catch (err) {
          console.error('Error parsing OAuth data:', err);
          setMessage('Error processing login data...');
          setTimeout(() => navigate('/login?error=invalid_data'), 1500);
        }
      } else {
        console.error('Missing OAuth data');
        setMessage('Missing authentication data...');
        setTimeout(() => navigate('/login?error=missing_data'), 1500);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loading-spinner" style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ fontSize: '18px', color: '#666' }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
