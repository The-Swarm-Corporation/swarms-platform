const currentDate = new Date();
const currentMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1,
  1,
);

export { currentDate, currentMonth };
