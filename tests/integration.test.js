const {
  checkScheduledTasks,
  scheduleTask,
  viewScheduledTasks,
} = require('../services/schedule');
const { handleStart } = require('../handlers/commandHandlers');
const { handleViewTasks } = require('../handlers/taskHandlers');
const { delTask, doneTask } = require('../services/taskManager');
const { scheduledTasks, userTasks, bot } = require('../data');

jest.mock('../data', () => ({
  scheduledTasks: [],
  userTasks: {},
  bot: {
    sendMessage: jest.fn(),
    once: jest.fn(),
  },
}));

jest.mock('../services/report', () => ({
  weeklyReport: jest.fn(),
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleStart sends a welcome message to the user', async () => {
    const msg = { chat: { id: 12345 } };
    await handleStart(msg);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      12345,
      expect.stringMatching(/Ласкаво/),
      expect.any(Object),
    );
  });

  test('handleViewTasks shows the user tasks', async () => {
    const chatId = 12345;
    const mockTasks = [
      { task: 'task1', done: false },
      { task: 'task2', done: true },
    ];

    require('../data').userTasks[chatId] = mockTasks;

    await handleViewTasks(chatId);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringMatching(/task1/),
      expect.any(Object),
    );
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    scheduledTasks.length = 0;
    for (let key in userTasks) delete userTasks[key];
    jest.clearAllMocks();
  });

  test('checkScheduledTasks - відправляє нагадування', () => {
    scheduledTasks.push({
      chatId: '1',
      task: 'Reminder Task',
      date: new Date(new Date().setHours(9, 0, 0)),
    });

    checkScheduledTasks();

    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      expect.stringMatching(/Нагадування/),
    );
    expect(scheduledTasks.length).toBe(0);
  });

  test('scheduleTask - перевіряє введення та планування завдання', async () => {
    bot.once.mockImplementation((event, callback) => {
      callback({ text: 'Test Task - 2024.12.10' });
    });

    await scheduleTask('1');

    expect(scheduledTasks.length).toBe(1);
    expect(scheduledTasks[0].task).toBe('Test Task');
    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      expect.stringMatching(/✅ Завдання/),
    );
  });

  test('viewScheduledTasks - перегляд запланованих завдань', () => {
    scheduledTasks.push({
      chatId: '1',
      task: 'Test View Task',
      date: new Date(),
    });

    viewScheduledTasks('1');

    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      expect.stringMatching(/Ось твій список запланованих завдань/),
    );
  });

  test('delTask - видалення завдання', () => {
    scheduledTasks.push({
      chatId: '1',
      task: 'Task to delete',
      date: new Date(),
    });

    delTask('1', 0);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      expect.stringMatching(/було видалено/),
    );
    expect(scheduledTasks.length).toBe(0);
  });

  test('doneTask - позначення завдання як виконане', () => {
    scheduledTasks.push({
      chatId: '1',
      task: 'Task to mark done',
      date: new Date(),
      done: false,
    });

    doneTask('1', 0);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      '1',
      expect.stringMatching(/позначено як виконане/),
    );
    expect(scheduledTasks[0].done).toBe(true);
  });
});