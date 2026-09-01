'use client';

import { useEffect, useRef, useState } from 'react';
import { useRateLimitStore } from '@/lib/store';

export default function RateLimitToast() {
  const { isRateLimited, rateLimitMessage, retryAfter, clearRateLimited } =
    useRateLimitStore();

  const [remaining, setRemaining] = useState(retryAfter);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(retryAfter);

  useEffect(() => {
    if (!isRateLimited) {
      setRemaining(0);
      remainingRef.current = 0;
      return;
    }

    setRemaining(retryAfter);
    remainingRef.current = retryAfter;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        return prev <= 1 ? 0 : prev - 1;
      })
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!);
        clearRateLimited(); 
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRateLimited, retryAfter]);

  if (!isRateLimited) return null;

  const progress = retryAfter > 0 ? (remaining / retryAfter) * 100 : 0;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '340px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
        border: '1px solid rgba(251, 146, 60, 0.35)',
        borderRadius: '12px',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(251,146,60,0.08)',
        overflow: 'hidden',
        animation: 'rl-slide-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      {/* Inline keyframe — avoids adding a global CSS file */}
      <style>{`
        @keyframes rl-slide-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(251,146,60,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#fb923c',
                textTransform: 'uppercase',
              }}
            >
              Rate Limited · 429
            </span>
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {remaining}s
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
            {rateLimitMessage || 'Too many requests. Please wait before submitting again.'}
          </p>
        </div>
      </div>

      {/* Countdown progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #fb923c, #f97316)',
            transition: 'width 1s linear',
            borderRadius: '0 0 0 0',
          }}
        />
      </div>
    </div>
  );
}
