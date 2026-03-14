import React from 'react';

interface QuoteCardShareableProps {
  quote: string;
  bookTitle: string;
  authorName?: string | null;
  coverUrl?: string | null;
  userName?: string | null;
  userImage?: string | null;
}

function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const QuoteCardShareable = React.forwardRef<
  HTMLDivElement,
  QuoteCardShareableProps
>(({ quote, bookTitle, authorName, coverUrl, userName, userImage }, ref) => {
  const initials = userName ? getInitials(userName) : null;

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        height: '420px',
        background: '#1e1e2e',
        color: '#cdd6f4',
        display: 'flex',
        flexDirection: 'row',
        padding: '40px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        position: 'relative',
        gap: '36px',
      }}
    >
      {/* Book cover */}
      {coverUrl && (
        <div
          style={{
            flexShrink: 0,
            width: '180px',
            height: '270px',
            borderRadius: '8px',
            overflow: 'hidden',
            alignSelf: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <img
            src={coverUrl}
            alt={bookTitle}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        {/* Quote text */}
        <div
          style={{
            fontSize: '20px',
            lineHeight: '1.65',
            textAlign: 'left',
            fontWeight: '400',
            color: '#cdd6f4',
          }}
        >
          "{quote}"
        </div>

        {/* Book and author info */}
        <div
          style={{
            fontSize: '15px',
            textAlign: 'left',
            fontWeight: '500',
          }}
        >
          <div style={{ marginBottom: '4px', color: '#89b4fa' }}>
            {bookTitle}
          </div>
          {authorName && (
            <div style={{ fontSize: '13px', color: '#a6adc8' }}>
              {authorName}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: user info (left) + branding (right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* User info */}
        {userName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : initials ? (
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #89b4fa 0%, #f5c2e7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: '600',
                  color: '#1e1e2e',
                }}
              >
                {initials}
              </div>
            ) : null}
            <span style={{ fontSize: '11px', color: '#585b70', fontWeight: '500' }}>
              {userName}
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* QuoteKeeper branding */}
        <div
          style={{
            fontSize: '11px',
            color: '#585b70',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          QuoteKeeper
        </div>
      </div>
    </div>
  );
});

QuoteCardShareable.displayName = 'QuoteCardShareable';
