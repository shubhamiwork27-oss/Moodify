import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { FaMusic, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo('.login-bg-orb', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out', stagger: 0.2 });
    tl.fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.8');
    tl.fromTo(logoRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.5');
    tl.fromTo('.anim-item', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: 'power2.out' }, '-=0.2');
  }, []);

  useEffect(() => {
    gsap.fromTo('.anim-item', { x: isLogin ? -12 : 12, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, duration: 0.35, ease: 'power2.out' });
  }, [isLogin]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, username: formData.username };
      const res = await axios.post(`http://localhost:3000${endpoint}`, payload, { withCredentials: true });
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        gsap.to(cardRef.current, { scale: 0.95, opacity: 0, y: -20, duration: 0.4, ease: 'power2.in', onComplete: () => navigate('/home') });
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Authentication failed. Please try again.');
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1.5, 0.3)' });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMsg('');
      setLoading(true);
      try {
        // Exchange access_token for user info
        const info = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        // Build a mock JWT payload for backend compatibility
        const res = await axios.post('http://localhost:3000/api/auth/google', {
          credential: tokenResponse.access_token,
          userInfo: info.data,
        }, { withCredentials: true });
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          gsap.to(cardRef.current, { scale: 0.95, opacity: 0, y: -20, duration: 0.4, ease: 'power2.in', onComplete: () => navigate('/home') });
        }
      } catch (error) {
        setErrorMsg('Google Sign-in failed. Please try email/password.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErrorMsg('Google Sign-in failed. Please try email/password.'),
  });

  return (
    <div className="login-container">
      {/* Animated background orbs */}
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />
      <div className="login-noise" />

      <div className="login-card" ref={cardRef}>
        {/* Logo */}
        <div className="login-logo" ref={logoRef}>
          <img src="/logo.png" alt="Moodify Logo" className="logo-img" />
        </div>

        <h1 className="login-title anim-item">Moodify</h1>
        <p className="login-subtitle anim-item">
          {isLogin ? 'Welcome back.' : 'Start listening today.'}
        </p>

        {errorMsg && (
          <div className="login-error anim-item">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        {/* Google — custom premium button */}
        <button
          type="button"
          className="google-custom-btn anim-item"
          onClick={() => googleLogin()}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
        </button>

        <div className="login-divider anim-item">
          <span />
          <p>or</p>
          <span />
        </div>

        {/* Manual form */}
        <form onSubmit={handleManualAuth} className="login-form">
          {!isLogin && (
            <div className="input-wrap anim-item">
              <MdPerson className="input-icon" size={18} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="login-input"
              />
            </div>
          )}
          <div className="input-wrap anim-item">
            <MdEmail className="input-icon" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="login-input"
            />
          </div>
          <div className="input-wrap anim-item">
            <MdLock className="input-icon" size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="login-input"
            />
            <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
              {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>

          <button type="submit" className="login-submit anim-item" disabled={loading}>
            {loading ? <span className="login-spinner" /> : (isLogin ? 'Log in' : 'Sign up')}
          </button>
        </form>

        <p className="login-toggle anim-item">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button className="login-toggle-btn" onClick={() => setIsLogin(l => !l)}>
            {isLogin ? ' Sign up' : ' Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
