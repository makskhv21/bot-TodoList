const { autoDeleteOldTasks } = require('../services/autoCleanup');
const { bot } = require('../data');

jest.mock('../data', () => ({
  bot: {
    sendMessage: jest.fn(),
  },
  scheduledTasks: [],
}));

describe('Stress Tests for TaskBot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Auto delete old tasks under heavy load', () => {
    const chatId = 1;
    const now = new Date();
    const tasks = Array.from({ length: 1000 }, (_, i) => ({
      chatId,
      task: `Старе завдання ${i + 1}`,
      date: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (i + 1),
      ).toISOString(),
    }));

    require('../data').scheduledTasks.push(...tasks);

    autoDeleteOldTasks();

    expect(bot.sendMessage).toHaveBeenCalledTimes(1000);
    tasks.forEach((task) => {
      expect(bot.sendMessage).toHaveBeenCalledWith(
        chatId,
        expect.stringContaining(
          `🗑️ Завдання "${task.task}" було автоматично видалено.`,
        ),
      );
    });
    expect(require('../data').scheduledTasks.length).toBe(0);
  });

  test('No tasks to delete when scheduledTasks is empty', () => {
    require('../data').scheduledTasks = [];

    autoDeleteOldTasks();

    expect(bot.sendMessage).not.toHaveBeenCalled();
  });

  test('No tasks deleted when all tasks are recent', () => {
    const chatId = 1;
    const now = new Date();
    const tasks = Array.from({ length: 1000 }, (_, i) => ({
      chatId,
      task: `Нове завдання ${i + 1}`,
      date: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString(),
    }));

    require('../data').scheduledTasks.push(...tasks);

    autoDeleteOldTasks();

    expect(bot.sendMessage).not.toHaveBeenCalled();
  });
});
