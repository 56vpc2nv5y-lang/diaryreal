// Lightweight in-memory rate limiter for the AI endpoints.
//
// Zero-cost, no external store. Note: serverless instances each keep their own
// counters, so this is a best-effort guard against a single client hammering one
// instance — not a globally exact quota. For hard global limits, back this with
// Upstash/Redis later (see MONETIZATION.md). It still meaningfully blunts abuse
// and runaway DeepSeek spend with no infra.

const buckets = new Map(); // key -> number[] (request timestamps, ms)

function clientKey(req) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : String(fwd || ''))
    .split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  return ip;
}

/**
 * Returns true if the request is allowed; otherwise writes a 429 and returns false.
 * @param {object} opts { limit, windowMs, name }
 */
export function rateLimit(req, res, { limit = 20, windowMs = 60_000, name = 'ai' } = {}) {
  const now = Date.now();
  const key = `${name}:${clientKey(req)}`;
  const hits = (buckets.get(key) || []).filter(ts => now - ts < windowMs);
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the Map cannot grow unbounded on a warm instance.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }

  const remaining = Math.max(0, limit - hits.length);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(remaining));

  if (hits.length > limit) {
    const retryMs = windowMs - (now - hits[0]);
    res.setHeader('Retry-After', String(Math.ceil(retryMs / 1000)));
    res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    return false;
  }
  return true;
}
