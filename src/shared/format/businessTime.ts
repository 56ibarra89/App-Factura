export const BUSINESS_TIME_ZONE = 'America/Managua';
// Nicaragua observa UTC-06:00 todo el año (Date#getTimezoneOffset positivo hacia el oeste = 360).
export const BUSINESS_TIMEZONE_OFFSET_MINUTES = 360;

const BUSINESS_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const BUSINESS_DATETIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: 'long',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const BUSINESS_DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('es-NI', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const BUSINESS_DISPLAY_TIME_FORMATTER = new Intl.DateTimeFormat('es-NI', {
  timeZone: BUSINESS_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const BUSINESS_DISPLAY_TIME_24_FORMATTER = new Intl.DateTimeFormat('es-NI', {
  timeZone: BUSINESS_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const BUSINESS_DISPLAY_DATETIME_FORMATTER = new Intl.DateTimeFormat('es-NI', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function toValidDate(input: Date | string | number): Date | null {
  const parsed = input instanceof Date ? input : new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatBusinessDate(
  input: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toValidDate(input);
  if (!date) return '';
  if (!options) return BUSINESS_DISPLAY_DATE_FORMATTER.format(date);
  return new Intl.DateTimeFormat('es-NI', {
    timeZone: BUSINESS_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatBusinessTime(
  input: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toValidDate(input);
  if (!date) return '';
  if (!options) return BUSINESS_DISPLAY_TIME_FORMATTER.format(date);
  return new Intl.DateTimeFormat('es-NI', {
    timeZone: BUSINESS_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatBusinessTime24(input: Date | string | number): string {
  const date = toValidDate(input);
  if (!date) return '';
  return BUSINESS_DISPLAY_TIME_24_FORMATTER.format(date);
}

export function formatBusinessDateTime(
  input: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toValidDate(input);
  if (!date) return '';
  if (!options) return BUSINESS_DISPLAY_DATETIME_FORMATTER.format(date);
  return new Intl.DateTimeFormat('es-NI', {
    timeZone: BUSINESS_TIME_ZONE,
    ...options,
  }).format(date);
}

const YMD_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseYmdCalendarParts(
  ymd: string,
): { year: number; month: number; day: number } | null {
  const match = YMD_PATTERN.exec(ymd.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(utc.getTime()) ||
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function shiftBusinessDateString(ymd: string, deltaDays: number): string {
  const parts = parseYmdCalendarParts(ymd);
  if (!parts) return ymd;
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + deltaDays));
  return utc.toISOString().slice(0, 10);
}

export function getBusinessMonthStartString(date: Date = new Date()): string {
  return `${getBusinessDateString(date).slice(0, 7)}-01`;
}

export function getPreviousBusinessMonthDateString(
  date: Date = new Date(),
): string {
  const parts = parseYmdCalendarParts(getBusinessDateString(date));
  if (!parts) return getBusinessDateString(date);
  const previousMonthLastDay = new Date(Date.UTC(parts.year, parts.month - 1, 0)).getUTCDate();
  const utc = new Date(Date.UTC(parts.year, parts.month - 2, Math.min(parts.day, previousMonthLastDay)));
  return utc.toISOString().slice(0, 10);
}

export function parseBusinessDayStart(ymd: string): Date | null {
  if (!parseYmdCalendarParts(ymd)) return null;
  return new Date(`${ymd.trim()}T00:00:00.000-06:00`);
}

export function parseBusinessDayEnd(ymd: string): Date | null {
  if (!parseYmdCalendarParts(ymd)) return null;
  return new Date(`${ymd.trim()}T23:59:59.999-06:00`);
}

export function formatBusinessCsvTimestamp(
  input: Date | string | number,
): string {
  const date = toValidDate(input);
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')} ${hour}:${get('minute')}:${get('second')}`;
}

export interface BusinessDateTimeParts {
  ymd: string;
  weekday: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
}

/**
 * Formatea una fecha como `YYYY-MM-DD` en la zona horaria oficial del negocio
 * (`America/Managua`), evitando cortes erróneos por UTC a las 6:00 p. m. local
 * o desfases si la terminal corre con otra zona horaria.
 */
export function getBusinessDateString(date: Date = new Date()): string {
  const parts = BUSINESS_DATE_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) {
    throw new Error('No se pudo formatear la fecha en zona horaria comercial');
  }
  return `${year}-${month}-${day}`;
}

export function getBusinessDateTimeParts(
  date: Date = new Date(),
): BusinessDateTimeParts {
  const parts = BUSINESS_DATETIME_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  const weekday = parts.find((part) => part.type === 'weekday')?.value?.toUpperCase();
  const rawHour = Number(parts.find((part) => part.type === 'hour')?.value);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value);
  const hour = rawHour === 24 ? 0 : rawHour;

  if (
    !year ||
    !month ||
    !day ||
    !weekday ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    throw new Error('No se pudo formatear fecha y hora en zona horaria comercial');
  }

  return {
    ymd: `${year}-${month}-${day}`,
    weekday,
    hours: hour,
    minutes: minute,
    totalMinutes: hour * 60 + minute,
  };
}
