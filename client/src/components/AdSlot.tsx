/**
 * AdSlot Component
 * ============================================================
 * Standardized ad slot component for displaying Google AdSense ads
 * across different pages and positions.
 * 
 * AdSense Policy Compliance:
 * - Clear "Ad" label above ad unit
 * - Sufficient spacing from content
 * - No misleading ad placement
 * - Transparent ad disclosure
 */

import React, { useEffect } from 'react';

interface AdSlotProps {
  /** Unique ad slot ID (e.g., "home-hero", "tool-sidebar") */
  slotId: string;
  /** AdSense publisher ID */
  publisherId?: string;
  /** Ad slot size: "horizontal", "vertical", "square", "responsive" */
  size?: 'horizontal' | 'vertical' | 'square' | 'responsive';
  /** Custom CSS class */
  className?: string;
  /** Show "Ad" label above the slot */
  showLabel?: boolean;
}

const AD_SIZES = {
  horizontal: { width: 728, height: 90 }, // Leaderboard
  vertical: { width: 300, height: 600 }, // Half page
  square: { width: 300, height: 250 }, // Medium rectangle
  responsive: { width: 'auto', height: 'auto' },
};

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  publisherId = process.env.REACT_APP_ADSENSE_PUBLISHER_ID || 'ca-pub-xxxxxxxxxxxxxxxx',
  size = 'responsive',
  className = '',
  showLabel = true,
}) => {
  const slotRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Push ad to Google AdSense
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [slotId]);

  const sizeConfig = AD_SIZES[size] || AD_SIZES.responsive;
  const isResponsive = size === 'responsive';

  return (
    <div
      className={`ad-slot-container ${className}`}
      style={{
        margin: '1.5rem 0',
        padding: '0.5rem',
        backgroundColor: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
      }}
    >
      {showLabel && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#999',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          廣告
        </div>
      )}

      <div
        ref={slotRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: isResponsive ? '100%' : sizeConfig.width,
          height: isResponsive ? 'auto' : sizeConfig.height,
        }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={size === 'responsive' ? 'auto' : 'rectangle'}
        data-full-width-responsive={size === 'responsive' ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSlot;

// Type augmentation for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}
