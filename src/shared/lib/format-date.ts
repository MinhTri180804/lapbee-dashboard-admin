const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const zonedFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

interface Parts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

function zonedParts(iso: string): Parts {
  const parts = Object.fromEntries(
    zonedFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return {
    year: parts.year ?? '',
    month: parts.month ?? '',
    day: parts.day ?? '',
    hour: parts.hour ?? '',
    minute: parts.minute ?? '',
  };
}

/** `YYYY-MM-DD` is a calendar date and is taken as-is. ISO date-times are shown in Asia/Ho_Chi_Minh. */
function resolveParts(value: string): Parts {
  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    const [, year = '', month = '', day = ''] = dateOnly;
    return { year, month, day, hour: '', minute: '' };
  }
  return zonedParts(value);
}

/** Returns `dd.mm.yyyy`. */
export function formatDate(value: string): string {
  const { day, month, year } = resolveParts(value);
  return `${day}.${month}.${year}`;
}

/** Returns `HH:MM · dd.mm.yyyy` (24-hour clock, Asia/Ho_Chi_Minh). */
export function formatDateTime(iso: string): string {
  const { hour, minute, day, month, year } = zonedParts(iso);
  return `${hour}:${minute} · ${day}.${month}.${year}`;
}
