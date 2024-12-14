jest.mock('../../data', () => ({
  scheduledTasks: [
    { task: 'Task 1', done: false },
    { task: 'Task 2', done: false },
  ],
  bot: {
    sendMessage: jest.fn(),
  },
}));

const { scheduledTasks, bot } = require('../../data');
const { delTask, doneTask } = require('../../services/taskManager');

describe('Task management functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    scheduledTasks.length = 0;
    scheduledTasks.push(
      { task: 'Task 1', done: false },
      { task: 'Task 2', done: false },
    );
  });

  describe('delTask', () => {
    test('should delete a task and send a confirmation message', () => {
      delTask(12345, 0);

      expect(scheduledTasks.length).toBe(1);
      expect(scheduledTasks[0].task).toBe('Task 2');
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '🗑️ Завдання "Task 1" було видалено.',
      );
    });

    test('should not delete any task if index is out of range', () => {
      delTask(12345, 5);

      expect(scheduledTasks.length).toBe(2);
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '❌ Помилка: завдання не знайдено.',
      );
    });

    test('should not delete any task if index is negative', () => {
      delTask(12345, -1);

      expect(scheduledTasks.length).toBe(2);
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '❌ Помилка: завдання не знайдено.',
      );
    });
  });

  describe('doneTask', () => {
    test('should mark a task as done and send a confirmation message', () => {
      doneTask(12345, 1);

      expect(scheduledTasks[1].done).toBe(true);
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '✅ Завдання "Task 2" позначено як виконане.',
      );
    });

    test('should not mark any task as done if index is out of range', () => {
      doneTask(12345, 5);

      expect(scheduledTasks[0].done).toBe(false);
      expect(scheduledTasks[1].done).toBe(false);
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '❌ Помилка: завдання не знайдено.',
      );
    });

    test('should not mark any task as done if index is negative', () => {
      doneTask(12345, -1);

      expect(scheduledTasks[0].done).toBe(false);
      expect(scheduledTasks[1].done).toBe(false);
      expect(bot.sendMessage).toHaveBeenCalledWith(
        12345,
        '❌ Помилка: завдання не знайдено.',
      );
    });
  });
});