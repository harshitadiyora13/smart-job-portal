import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';

const GoogleSignInButton = ({ onSuccess, role = 'jobseeker', buttonText = 'Continue with Google' }) => {
    const [loading, setLoading] = useState(false);

    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.warn('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file');
        return (
            <div className="alert alert-warning py-2 small text-center">
                Google Sign-In not configured.<br />
                <small>Add VITE_GOOGLE_CLIENT_ID to your .env file</small>
            </div>
        );
    }

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        try {
            // Get the ID token from Google
            const idToken = tokenResponse.credential || tokenResponse.access_token;

            // If we got an access_token instead of credential, we need to handle it differently
            if (tokenResponse.access_token) {
                // For implicit flow, we need to fetch user info
                const userInfoResponse = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`
                        }
                    }
                );
                const userInfo = await userInfoResponse.json();

                // Send user info to backend
                const res = await axios.post('http://localhost:5000/v1/api/auth/google', {
                    userInfo: userInfo,
                    role: role
                });

                if (onSuccess) {
                    onSuccess(res.data);
                }
                return;
            }

            // For credential flow (ID token)
            const res = await axios.post('http://localhost:5000/v1/api/auth/google', {
                idToken: idToken,
                role: role
            });

            if (onSuccess) {
                onSuccess(res.data);
            }
        } catch (error) {
            console.error('Google auth error:', error);
            const errorMessage = error.response?.data?.message || 'Google authentication failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google sign-in was cancelled or failed');
    };

    // Use the Google Login hook
    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        flow: 'implicit', // Use implicit flow to get access token
        scope: 'openid email profile'
    });

    return (
        <button
            onClick={() => login()}
            disabled={loading}
            className="btn btn-outline-dark w-100 py-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
            style={{
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#374151'
            }}
        >
            {loading ? (
                <>
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    Connecting...
                </>
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {buttonText}
                </>
            )}
        </button>
    );
};

export default GoogleSignInButton;
