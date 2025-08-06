import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for the reset link.");
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("Seems like you entered a wrong email or the user is not registered. Please try again.");
      } else {
        setMessage(err.response?.data?.message || "Failed to send reset link.");
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
        width: '400px',
        textAlign: 'center',
      }}>
        {!submitted ? (
          <>
            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Forgot Password?</h2>
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>
              Enter your email to receive a password reset link.
            </p>
            {message && (
              <p style={{
                color: message.includes('Failed') || message.includes('wrong') ? '#ff4444' : '#4CAF50',
                marginBottom: '20px',
                fontSize: '14px',
              }}>
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Success!</h2>
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>
              {message}
            </p>
            <div style={{
              fontSize: '40px',
              marginBottom: '20px',
            }}>✉️</div>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
                setMessage('');
                window.location.href = '/login';
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2196F3',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1E88E5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
            >
              Back to Form
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;