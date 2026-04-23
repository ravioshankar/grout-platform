/** Single 0–100 score from recent performance (volume + average + pass rate). */
export function computeReadinessScore(
  averageScore: number,
  passRate: number,
  totalTests: number
): number {
  if (totalTests <= 0) return 0;
  const volume = Math.min(totalTests / 5, 1) * 25;
  const avg = (averageScore / 100) * 45;
  const pass = (passRate / 100) * 30;
  return Math.round(Math.min(100, avg + pass + volume));
}
