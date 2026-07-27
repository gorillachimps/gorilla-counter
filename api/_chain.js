// Shared on-chain reads for the share-card routes (edge runtime, no deps).
export const CONTRACT = '0x90fc6B668293Bc2d9Ce78eC6E1c2d0d2c00EE668';
export const APP_ORIGIN = 'https://gorilla-counter.vercel.app';

const RPCS = ['https://mainnet.base.org', 'https://base-rpc.publicnode.com'];

const SEL = {
  chestBeats: '0x29275322',
  gorillaBeats: '0xd8b7610a',
  gorillaNames: '0xdff490f8',
};

// Known gorillas as of the last seed refresh — rank is computed against this
// set so a card render is a fixed, small number of RPC reads (no log scan).
export const KNOWN = [
  '0x7584b2caf8070852f7887ee10d86f981dc128eec',
  '0x549063dd3380440e2c92c9709a49b616237c0e28',
  '0x8a03f8237fa235bf149613e5697a3273b0b8a3ac',
  '0x9a25025f722305b4336ccd7e67995e691a12426e',
  '0x6bd7a2443bcf663a7fcbe1b36f219797ad63e96a',
];

export const isAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(a || '');

async function rpc(method, params) {
  let lastErr;
  for (const url of RPCS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error.message || 'rpc error');
      return j.result;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

const call = (data) => rpc('eth_call', [{ to: CONTRACT, data }, 'latest']);
const pad = (a) => a.slice(2).toLowerCase().padStart(64, '0');
const toInt = (hex) => (!hex || hex === '0x' ? 0 : Number(BigInt(hex)));

function decodeString(hex) {
  if (!hex || hex === '0x' || hex.length < 130) return '';
  try {
    const len = parseInt(hex.slice(66, 130), 16);
    if (len === 0 || len > 256) return '';
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = parseInt(hex.substr(130 + i * 2, 2), 16);
    return new TextDecoder().decode(bytes);
  } catch { return ''; }
}

/** Beats, name, community total, and rank within the known set. */
export async function getGorilla(addr) {
  const target = addr.toLowerCase();
  const roster = KNOWN.includes(target) ? KNOWN : [...KNOWN, target];

  const [totalHex, nameHex, ...beatHexes] = await Promise.all([
    call(SEL.chestBeats),
    call(SEL.gorillaNames + pad(target)),
    ...roster.map((a) => call(SEL.gorillaBeats + pad(a))),
  ]);

  const scores = roster
    .map((a, i) => ({ addr: a, beats: toInt(beatHexes[i]) }))
    .filter((g) => g.beats > 0)
    .sort((a, b) => b.beats - a.beats || a.addr.localeCompare(b.addr));

  const idx = scores.findIndex((g) => g.addr === target);
  const short = target.slice(0, 6) + '…' + target.slice(-4);

  return {
    addr: target,
    name: decodeString(nameHex) || short,
    beats: idx === -1 ? 0 : scores[idx].beats,
    rank: idx === -1 ? 0 : idx + 1,
    field: scores.length,
    total: toInt(totalHex),
  };
}
