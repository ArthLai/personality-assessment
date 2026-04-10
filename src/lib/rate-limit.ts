const DAILY_LIMIT = 10;

// In-memory store: key = "YYYY-MM-DD:IP" → count
const store = new Map<string, number>();

function getDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cleanOldEntries(): void {
  const today = getDateKey();
  for (const key of store.keys()) {
    if (!key.startsWith(today)) store.delete(key);
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  cleanOldEntries();

  const key = `${getDateKey()}:${ip}`;
  const current = store.get(key) || 0;

  if (current >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  store.set(key, current + 1);
  return { allowed: true, remaining: DAILY_LIMIT - current - 1 };
}
