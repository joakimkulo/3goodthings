export function safeTimeZone(value) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return value;
  } catch {
    return 'UTC';
  }
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
}

function addDays({ year, month, day }, amount) {
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function offsetAt(date, timeZone) {
  const p = zonedParts(date, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - date.getTime();
}

export function nextEightUtc(timeZoneInput, from = new Date()) {
  const timeZone = safeTimeZone(timeZoneInput);
  const now = zonedParts(from, timeZone);
  const localDate = addDays(now, now.hour >= 8 ? 1 : 0);
  const wallClock = Date.UTC(localDate.year, localDate.month - 1, localDate.day, 8, 0);
  let candidate = new Date(wallClock - offsetAt(new Date(wallClock), timeZone));
  candidate = new Date(wallClock - offsetAt(candidate, timeZone));
  return candidate;
}

export function editionDateFor(timeZoneInput, at = new Date()) {
  const timeZone = safeTimeZone(timeZoneInput);
  const local = zonedParts(at, timeZone);
  const date = addDays(local, local.hour < 8 ? -1 : 0);
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}
