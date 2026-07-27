import { ImageResponse } from '@vercel/og';
import { getGorilla, isAddress, APP_ORIGIN } from './_chain.js';

export const config = { runtime: 'edge' };

const BG = '#080B09';
const TEXT = '#E8EFEA';
const MUTED = '#95A99C';
const ACCENT = '#FF7A1A';
const BRAND = '#5BC46F';

// Satori accepts plain React-shaped objects, so no JSX/React dependency.
const node = (type, props) => ({ type, props });
const box = (style, children) => node('div', { style, children });
const text = (style, children) => node('div', { style: { display: 'flex', ...style }, children });

function card(g) {
  const badge = g.rank ? `#${g.rank} of ${g.field}` : 'New';
  const beats = g.rank
    ? `${g.beats.toLocaleString()} chest beat${g.beats === 1 ? '' : 's'}`
    : 'No beats yet';

  return box(
    {
      display: 'flex', width: '100%', height: '100%', background: BG, color: TEXT,
      padding: '68px', alignItems: 'center', gap: '56px', fontFamily: 'sans-serif',
    },
    [
      node('img', {
        src: `${APP_ORIGIN}/gorilla-portrait.jpg`,
        width: 300,
        height: 300,
        style: { borderRadius: '150px', border: `2px solid ${BRAND}`, objectFit: 'cover' },
      }),
      box({ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '300px' }, [
        text({ fontSize: 26, letterSpacing: '0.14em', color: MUTED, marginBottom: '12px' },
          'GORILLA COUNTER'),
        text({ fontSize: 74, fontWeight: 700, lineHeight: 1.05, marginBottom: '22px' }, g.name),
        box({ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }, [
          text({
            background: ACCENT, color: '#180A02', fontSize: 38, fontWeight: 700,
            padding: '6px 20px', borderRadius: '14px',
          }, badge),
          text({ fontSize: 38 }, beats),
        ]),
        text({ fontSize: 32, color: MUTED },
          g.rank === 1 ? 'Alpha Gorilla. Come take it.' : 'Can you beat me?'),
        text({ fontSize: 24, color: MUTED, marginTop: 'auto' },
          `${g.total.toLocaleString()} beats onchain  ·  Built on Base`),
      ]),
    ]
  );
}

export default async function handler(req) {
  const fallback = () => Response.redirect(`${APP_ORIGIN}/og-image.jpg`, 302);
  try {
    const u = new URL(req.url).searchParams.get('u') || '';
    if (!isAddress(u)) return fallback();

    const g = await getGorilla(u);
    return new ImageResponse(card(g), {
      width: 1200,
      height: 630,
      headers: { 'cache-control': 'public, max-age=300, s-maxage=300' },
    });
  } catch {
    // A share must never render imageless — fall back to the static banner
    return fallback();
  }
}
