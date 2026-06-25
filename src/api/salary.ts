interface SalaryConfig {
  monthlySalary: number;
  workHoursPerDay: number;
  workStartHour: number;
  workStartMinute: number;
}

const mockConfig: SalaryConfig = {
  monthlySalary: 20000,
  workHoursPerDay: 8,
  workStartHour: 9,
  workStartMinute: 0,
};

export const getSalaryConfig = (): Promise<{ code: number; data: SalaryConfig }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, data: mockConfig });
    }, 300);
  });
};
