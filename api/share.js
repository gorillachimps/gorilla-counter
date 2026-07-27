import { getGorilla, isAddress, APP_ORIGIN } from './_chain.js';

export const config = { runtime: 'edge' };

// On-chain names are attacker-controlled: escape before they touch markup.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req) {
  const u = new URL(req.url).searchParams.get('u') || '';
  if (!isAddress(u)) return Response.redirect(`${APP_ORIGIN}/`, 302);

  let g;
  try {
    g = await getGorilla(u);
  } catch {
    g = { name: u.slice(0, 6) + '…' + u.slice(-4), beats: 0, rank: 0, field: 0, total: 0 };
  }

  const img = `${APP_ORIGIN}/api/og?u=${u}`;
  const title = g.rank
    ? `${g.name} is #${g.rank} on Gorilla Counter`
    : 'Gorilla Counter — beat your chest on Base';
  const desc = g.rank
    ? `${g.beats.toLocaleString()} chest beats onchain. Can you beat them?`
    : 'The onchain chest-beating competition on Base.';

  const embed = JSON.stringify({
    version: '1',
    imageUrl: img,
    button: {
      title: '🦍 Beat Your Chest!',
      action: {
        type: 'launch_miniapp',
        name: 'Gorilla Counter',
        url: `${APP_ORIGIN}/`,
        splashImageUrl: `${APP_ORIGIN}/icon.png`,
        splashBackgroundColor: '#0a0f0a',
      },
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${APP_ORIGIN}/s/${u}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">
<meta name="fc:miniapp" content="${esc(embed)}">
<meta name="fc:frame" content="${esc(embed.replace('launch_miniapp', 'launch_frame'))}">
<meta name="base:app_id" content="69931a50e0d5d2cf831b5deb">
<link rel="canonical" href="${APP_ORIGIN}/">
<style>body{background:#080B09;color:#E8EFEA;font-family:Inter,system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0}a{color:#5BC46F}</style>
</head><body>
<p>Opening Gorilla Counter… <a href="${APP_ORIGIN}/">Continue</a></p>
<script>location.replace(${JSON.stringify(APP_ORIGIN + '/')});</script>
</body></html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}
