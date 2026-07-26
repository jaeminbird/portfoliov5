import { ImageResponse } from 'next/og';
import { COLORS } from '@/lib/constants';

/**
 * Build-time social share card.
 *
 * Replaces the previously hardcoded `/og-image.png`, which was referenced by
 * layout.tsx metadata but never existed — so every share unfurled with a
 * broken image. Using the file convention means Next wires up both the
 * `og:image` and `twitter:image` tags with correct dimensions automatically.
 */
export const alt = 'Jae Birdsall — Machine Learning Engineer & Full Stack Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          padding: '96px',
        }}
      >
        {/* Accent rule — the site's primary brand element */}
        <div
          style={{
            width: '120px',
            height: '16px',
            backgroundColor: COLORS.accent,
            borderRadius: '8px',
            marginBottom: '48px',
          }}
        />

        <div
          style={{
            fontSize: '112px',
            fontWeight: 700,
            color: COLORS.dark,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          Jae Birdsall
        </div>

        <div
          style={{
            fontSize: '44px',
            color: '#4B5563',
            marginTop: '32px',
            lineHeight: 1.3,
          }}
        >
          Machine Learning Engineer
        </div>

        <div
          style={{
            fontSize: '44px',
            color: '#4B5563',
            lineHeight: 1.3,
          }}
        >
          &amp; Full Stack Developer
        </div>

        <div
          style={{
            fontSize: '30px',
            color: '#6B7280',
            marginTop: 'auto',
          }}
        >
          jaebirdsall.com
        </div>
      </div>
    ),
    { ...size },
  );
}
