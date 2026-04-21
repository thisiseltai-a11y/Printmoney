import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ResumeRocket — AI Resume Builder That Lands Interviews'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0f172a',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.25)',
            filter: 'blur(80px)',
          }}
        />
        {/* Background glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.2)',
            filter: 'blur(80px)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🚀
          </div>
          <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            ResumeRocket
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '62px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            color: '#ffffff',
            marginBottom: '28px',
            maxWidth: '820px',
          }}
        >
          Job-Ready Resume{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            in 60 Seconds
          </span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            marginBottom: '48px',
            maxWidth: '700px',
            lineHeight: 1.5,
          }}
        >
          ATS-optimized resume + cover letter tailored to any job. AI-powered. Instant download.
        </div>

        {/* Trust pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            '✓  From $12',
            '✓  Cover Letter Included',
            '✓  Money-Back Guarantee',
          ].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '100px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#c7d2fe',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Domain watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            color: '#475569',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          resumerocket.co
        </div>
      </div>
    ),
    { ...size }
  )
}
