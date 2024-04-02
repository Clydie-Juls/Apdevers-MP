import React, { useState, useEffect } from 'react';
import AnimBackground from "@/components/custom/animBackground";
import { LoginForm } from "@/components/custom/loginForm";
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const { state } = location;
  const [message, setMessage] = useState(state?.message || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessage('');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div>
      {message && (
        <p style={{ fontSize: '1.2rem', textAlign: 'center', margin: '0 auto', marginTop: '20px' }}>{message}</p>
      )}
      <AnimBackground className="flex items-center justify-center">
        <LoginForm />
      </AnimBackground>
    </div>
  );
};

export default Login;