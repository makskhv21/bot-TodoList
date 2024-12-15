const {
  checkScheduledTasks,
  scheduleTask,
  viewScheduledTasks,
} = require('../../services/schedule');
const { bot, scheduledTasks } = require('../../data');

jest.mock('../../data', () => ({
  bot: {
    sendMessage: jest.fn(),
    once: jest.fn(),
  },
  scheduledTasks: [],
}));

describe('checkScheduledTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scheduledTasks.length = 0;
  });

  it('should send a reminder and remove the task if the task is scheduled for the current time', () => {
    const now = new Date();
    scheduledTasks.push({
      chatId: 123,
      task: 'Test task',
      date: new Date(now.setHours(9, 0, 0, 0)),
    });

    checkScheduledTasks();

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '⏰ Нагадування: Test task',
    );
    expect(scheduledTasks).toHaveLength(0);
  });

  it('should not send a reminder if the task is not at 9:00 on the same day', () => {
    scheduledTasks.push({
      chatId: 123,
      task: 'Test task',
      date: new Date('2024-12-08T10:00:00'),
    });

    checkScheduledTasks();

    expect(bot.sendMessage).not.toHaveBeenCalled();
    expect(scheduledTasks).toHaveLength(1);
  });

  it('should ignore tasks scheduled for another date', () => {
    scheduledTasks.push({
      chatId: 123,
      task: 'Test task',
      date: new Date('2024-12-15'),
    });

    checkScheduledTasks();

    expect(bot.sendMessage).not.toHaveBeenCalled();
    expect(scheduledTasks).toHaveLength(1);
  });

  it('should handle empty scheduledTasks array gracefully', () => {
    checkScheduledTasks();
    expect(bot.sendMessage).not.toHaveBeenCalled();
  });
});

describe('scheduleTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scheduledTasks.length = 0;
  });

  it('should prompt the user for a valid input format', () => {
    scheduleTask(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      'Введи завдання у форматі: Текст завдання - Дата (наприклад: Завдання на тренування - 2024.12.08):',
    );
  });

  it('should reject invalid input format', () => {
    bot.once.mockImplementation((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Invalid input', chatId: 123 });
      }
    });

    scheduleTask(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Невірний формат. Спробуй ще раз.',
    );
    expect(scheduledTasks).toHaveLength(0);
  });

  it('should save a valid task to the scheduledTasks array', () => {
    bot.once.mockImplementation((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Test task - 2024.12.10', chatId: 123 });
      }
    });

    scheduleTask(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      `✅ Завдання "Test task" заплановано на Tue Dec 10 2024.`,
    );
    expect(scheduledTasks).toHaveLength(1);
    expect(scheduledTasks[0]).toEqual({
      chatId: 123,
      task: 'Test task',
      date: expect.any(Date),
    });
  });

  it('should cancel task scheduling if the user types "Вийти"', () => {
    bot.once.mockImplementation((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Вийти', chatId: 123 });
      }
    });

    scheduleTask(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      'Відмінено планування завдання.',
    );
    expect(scheduledTasks).toHaveLength(0);
  });
});

describe('viewScheduledTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scheduledTasks.length = 0;
  });

  it('should notify if no tasks are scheduled', () => {
    viewScheduledTasks(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❗ У тебе немає запланованих завдань.',
    );
  });

  it('should show a list of tasks if tasks exist', () => {
    scheduledTasks.push({
      chatId: 123,
      task: 'Task 1',
      date: new Date('2024-12-10'),
    });
    scheduledTasks.push({
      chatId: 123,
      task: 'Task 2',
      date: new Date('2024-12-11'),
    });

    viewScheduledTasks(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining(
        '1. ❌ Task 1 - Tue Dec 10 2024\n2. ❌ Task 2 - Wed Dec 11 2024',
      ),
    );
  });

  it('should show the correct format even if tasks are very close together', () => {
    scheduledTasks.push({
      chatId: 123,
      task: 'Task A',
      date: new Date('2024-12-10'),
    });
    scheduledTasks.push({
      chatId: 123,
      task: 'Task B',
      date: new Date('2024-12-10T10:00:00'),
    });

    viewScheduledTasks(123);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining(
        '1. ❌ Task A - Tue Dec 10 2024\n2. ❌ Task B - Tue Dec 10 2024',
      ),
    );
  });
});
