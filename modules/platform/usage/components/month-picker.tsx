import React, { ChangeEvent } from 'react';

const MonthPicker = ({
  onMonthChange,
  month = new Date(),
}: {
  onMonthChange: (newMonth: Date) => void;
  month?: Date;
}) => {
  const handleMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMonth = new Date(event.target.value);
    onMonthChange(newMonth);
  };

  return (
    <div className="flex items-center justify-between max-sm:mt-2">
      <label
        hidden
        htmlFor="month-selector"
        className="text-sm font-medium text-gray-700 mr-2"
      >
        Select Month:
      </label>
      <input
        type="month"
        id="month-selector"
        name="month-selector"
        value={month.toISOString().slice(0, 7)}
        onChange={handleMonthChange}
        className="rounded-md border border-gray-300 px-2 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
};

export default MonthPicker;
