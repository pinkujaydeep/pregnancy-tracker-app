export function calculateDueDate(lmpDate) {
  const lmp = new Date(lmpDate);
  const due = new Date(lmp);
  due.setDate(due.getDate() + 280); // 40 weeks
  return due;
}

export function calculatePregnancyProgress(lmpDate) {
  const lmp = new Date(lmpDate);
  const today = new Date();

  const diffMs = today - lmp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const week = Math.floor(diffDays / 7) + 1;
  const day = diffDays % 7;

  let trimester = 1;
  if (week >= 14 && week <= 27) trimester = 2;
  if (week >= 28) trimester = 3;

  return { diffDays, week, day, trimester };
}