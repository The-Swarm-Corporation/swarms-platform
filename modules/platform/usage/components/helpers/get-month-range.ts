export function getMonthRange(month: Date) {
  const date = new Date(month);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const formattedMonthStart = `${monthStart.toLocaleString('default', { month: 'long' })} 1`;
  const formattedMonthEnd = `${monthEnd.toLocaleString('default', { month: 'long' })} ${monthEnd.getDate()}`;

  return `${formattedMonthStart} - ${formattedMonthEnd}`;
}
