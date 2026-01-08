import React from 'react';
import { Bot, KeyRound } from 'lucide-react';

interface LoginPageProps {
      onLogin: () => void;
      isLoading: boolean;
}

export default function LoginPage({ onLogin, isLoading }: LoginPageProps) {
      return (
            <div className="login-container" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '2rem',
                  textAlign: 'center',
                  background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%)'
            }}>
                  <div style={{
                        padding: '2rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%',
                        maxWidth: '300px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  }}>
                        <div style={{
                              width: '64px',
                              height: '64px',
                              margin: '0 auto 1.5rem',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              borderRadius: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                              <Bot size={32} color="white" />
                        </div>

                        <h1 style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              marginBottom: '0.5rem',
                              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                        }}>
                              Welcome Back
                        </h1>

                        <p style={{
                              color: '#94a3b8',
                              fontSize: '0.9rem',
                              marginBottom: '2rem',
                              lineHeight: '1.5'
                        }}>
                              Sign in to access your personal AI browser assistant.
                        </p>

                        <button
                              onClick={onLogin}
                              disabled={isLoading}
                              style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: 'white',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'transform 0.1s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }}
                        >
                              {isLoading ? (
                                    'Signing in...'
                              ) : (
                                    <>
                                          <svg width="20" height="20" viewBox="0 0 24 24">
                                                <path
                                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                      fill="#4285F4"
                                                />
                                                <path
                                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                      fill="#34A853"
                                                />
                                                <path
                                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                      fill="#FBBC05"
                                                />
                                                <path
                                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                      fill="#EA4335"
                                                />
                                          </svg>
                                          Sign in with Google
                                    </>
                              )}
                        </button>
                  </div>
            </div>
      );
}
