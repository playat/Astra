interface SalaryConfig {
  monthlySalary: number;
  workHoursPerDay: number;
  workStartHour: number;
  workStartMinute: number;
  lunchStartHour: number;
  lunchStartMinute: number;
  lunchEndHour: number;
  lunchEndMinute: number;
}

const mockConfig: SalaryConfig = {
  monthlySalary: 6500,
  workHoursPerDay: 7.5,
  workStartHour: 9,
  workStartMinute: 0,
  lunchStartHour: 12,
  lunchStartMinute: 0,
  lunchEndHour: 14,
  lunchEndMinute: 0,
};

export const getSalaryConfig = (): Promise<{ code: number; data: SalaryConfig }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, data: mockConfig });
    }, 300);
  });
};
