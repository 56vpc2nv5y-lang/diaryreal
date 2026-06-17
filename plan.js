// Monetization scaffold — PRESENT BUT NOT ENFORCED.
//
// Today everything is free: tier() is always 'free' and canShake() always returns
// true. This only records lightweight usage in localStorage so that, when we later
// decide to charge (see MONETIZATION.md), the metering hooks and call sites already
// exist and we can flip on quota checks without touching the UI flow.

(function () {
  const LIMITS = {
    free: { shakesPerMonth: 30 }, // soft target; NOT enforced yet
    pro: { shakesPerMonth: Infinity },
  };

  const monthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  const usageKey = () => `d-plan-usage-${monthKey()}`;

  function shakeCountThisMonth() {
    return Number(localStorage.getItem(usageKey()) || '0');
  }

  function recordShake() {
    try {
      localStorage.setItem(usageKey(), String(shakeCountThisMonth() + 1));
      // Keep storage tidy: drop counters older than the current month.
      const keep = usageKey();
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith('d-plan-usage-') && k !== keep) localStorage.removeItem(k);
      }
    } catch (_) { /* storage may be unavailable; metering is best-effort */ }
    return shakeCountThisMonth();
  }

  // Tier is read-only for now. Later: source from Firestore users/{uid}/billing.
  function tier() {
    return localStorage.getItem('d-plan-tier') === 'pro' ? 'pro' : 'free';
  }

  // Quota gate. Intentionally always-allow today; flip the early return on at launch.
  function canShake() {
    return true;
    // Future:
    // const limit = LIMITS[tier()]?.shakesPerMonth ?? Infinity;
    // return shakeCountThisMonth() < limit;
  }

  window.PLAN = { LIMITS, tier, canShake, recordShake, shakeCountThisMonth, monthKey };
})();
