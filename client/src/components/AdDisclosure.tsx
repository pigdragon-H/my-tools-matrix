/**
 * Ad Disclosure Component
 * ============================================================
 * Transparent ad disclosure for AdSense compliance
 */

import React from 'react';

interface AdDisclosureProps {
  /** Position: top, bottom, inline */
  position?: 'top' | 'bottom' | 'inline';
  /** Custom message */
  message?: string;
}

export const AdDisclosure: React.FC<AdDisclosureProps> = ({
  position = 'top',
  message = '此頁面包含廣告。我們使用廣告收入來維持網站運營。',
}) => {
  const containerStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: position === 'top' ? '1.5rem' : '0',
    marginTop: position === 'bottom' ? '1.5rem' : '0',
  };

  return (
    <div style={containerStyle}>
      <strong style={{ color: '#374151' }}>廣告聲明：</strong> {message}
    </div>
  );
};

export default AdDisclosure;

