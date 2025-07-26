/**
 * Calculates the user's login streak based on their last login date
 * @param lastLoginDate The user's last login date
 * @returns number The current streak count
 */
export function calculateStreak(lastLoginDate: Date | null): number {
  if (!lastLoginDate) {
    return 1; // First login
  }

  const now = new Date();
  const last = new Date(lastLoginDate);
  
  // Reset hours, minutes, seconds and milliseconds to compare dates only
  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  // Calculate the difference in days
  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If they already logged in today, maintain current streak
  if (diffDays === 0) {
    return last.getTime() === now.getTime() ? 1 : 0;
  }

  // If they logged in yesterday, increment streak
  if (diffDays === 1) {
    return 1;
  }

  // If they missed a day, reset streak
  return 0;
}