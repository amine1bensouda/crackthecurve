import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1D2A45',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: '6px solid #3F7267',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FDFBF7',
            fontSize: '72px',
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
