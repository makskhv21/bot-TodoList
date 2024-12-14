const { bot } = require('../../data');
const { scheduleWeeklyReport, weeklyReport } = require('../../services/report');

jest.mock('../../data', () => {
  const mockBot = {
    sendMessage: jest.fn(),
  };

  const mockUserTasks = {
    1: [{ done: true }, { done: false }, { done: true }],
    2: [{ done: true }, { done: true }],
    3: [],
  };

  const mockScheduledTasks = [{ chatId: 123 }, { chatId: 456 }];

  return {
    bot: mockBot,
    userTasks: mockUserTasks,
    scheduledTasks: mockScheduledTasks,
  };
});

jest.useFakeTimers();

describe('weeklyReport', () => {
  it('should correctly calculate tasks for multiple users with mixed completed and incomplete tasks', () => {
    const totalTasks = 5;
    const completedTasks = 4;
    const scheduledCount = 2;

    weeklyReport();

    expect(bot.sendMessage).toHaveBeenCalledTimes(3);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      `📊 Звіт за поточний тиждень:\n  - Загальна кількість завдань: ${totalTasks}\n  - Кількість виконаних завдань: ${completedTasks}\n  - Кількість запланованих завдань: ${scheduledCount}`,
    );
    expect(bot.sendMessage).toHaveBeenCalledWith(
      '2',
      `📊 Звіт за поточний тиждень:\n  - Загальна кількість завдань: ${totalTasks}\n  - Кількість виконаних завдань: ${completedTasks}\n  - Кількість запланованих завдань: ${scheduledCount}`,
    );
    expect(bot.sendMessage).toHaveBeenCalledWith(
      '3',
      `📊 Звіт за поточний тиждень:\n  - Загальна кількість завдань: ${totalTasks}\n  - Кількість виконаних завдань: ${completedTasks}\n  - Кількість запланованих завдань: ${scheduledCount}`,
    );
  });
});

describe('scheduleWeeklyReport', () => {
  it('should correctly calculate and schedule the next report', () => {
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7));
    nextMonday.setHours(12, 0, 0);

    const timeUntilNextReport = nextMonday - now;

    const timeoutMock = jest.fn();
    global.setTimeout = timeoutMock;

    scheduleWeeklyReport();

    expect(timeoutMock).toHaveBeenCalledWith(
      expect.any(Function),
      timeUntilNextReport,
    );
  });

  it('should trigger the weekly report exactly at noon next Monday', () => {
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7));
    nextMonday.setHours(12, 0, 0);

    const timeUntilNextReport = nextMonday - now;
    const timeoutMock = jest.fn();
    global.setTimeout = timeoutMock;

    scheduleWeeklyReport();

    expect(timeoutMock).toHaveBeenCalledWith(
      expect.any(Function),
      timeUntilNextReport,
    );
  });
});
