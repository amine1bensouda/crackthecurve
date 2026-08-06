import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

/** Favicon PNG 48×48 — format préféré par Google Search */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1D2A45',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid #3F7267',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FDFBF7',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
