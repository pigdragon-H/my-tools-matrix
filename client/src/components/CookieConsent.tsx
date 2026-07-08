/**
 * Cookie Consent Banner Component
 * ============================================================
 * GDPR/CCPA compliant cookie consent banner for ad personalization
 * and analytics tracking.
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookieConsentProps {
  /** Custom message text */
  message?: string;
  /** Accept button text */
  acceptText?: string;
  /** Reject button text */
  rejectText?: string;
  /** Privacy policy URL */
  privacyUrl?: string;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  message = '我們使用 Cookie 和廣告技術來改善您的體驗。',
  acceptText = '同意',
  rejectText = '拒絕',
  privacyUrl = '/privacy',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookie-consent');
    if (!consentChoice) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Enable Google AdSense personalization
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('consent', 'update', {
      ad_personalization: 'granted',
      ad_storage: 'granted',
      analytics_storage: 'granted',
    });

    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Disable personalization
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('consent', 'update', {
      ad_personalization: 'denied',
      ad_storage: 'denied',
      analytics_storage: 'denied',
    });

    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1f2937',
        color: '#fff',
        padding: '1.5rem',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 9999,
        animation: isAnimating ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {message}
              {privacyUrl && (
                <>
                  {' '}
                  <a
                    href={privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60a5fa', textDecoration: 'underline' }}
                  >
                    查看隱私政策
                  </a>
                </>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAccept}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                }}
              >
                {acceptText}
              </button>

              <button
                onClick={handleReject}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid #6b7280',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#374151';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                {rejectText}
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color = '#9ca3af';
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

// Type augmentation for window.dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}
