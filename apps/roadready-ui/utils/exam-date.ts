export const EXAM_TARGET_DATE_KEY = 'exam_target_date';

export function parseExamYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

export function formatExamCountdown(iso: string | null): string | null {
  if (!iso) return null;
  const target = parseExamYmd(iso);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `Exam was ${Math.abs(diff)} day(s) ago`;
  if (diff === 0) return 'Exam is today';
  if (diff === 1) return '1 day until exam';
  return `${diff} days until exam`;
}
