jest.mock('../../data', () => ({
  bot: {
    sendMessage: jest.fn(),
    once: jest.fn(),
  },
  userTasks: {},
}));

jest.mock('../../keyboards/keyboards', () => ({
  mainMenuKeyboard: { reply_markup: { keyboard: [['Button 1']] } },
  addTaskKeyboard: { reply_markup: { keyboard: [['Finish']] } },
}));

jest.mock('../../utils/utils', () => ({
  getTodayFormatted: jest.fn(() => '2024-12-09'),
}));

const {
  sendFeedbackMessage,
  sendCommandsList,
  handleAddTask,
  handleViewTasks,
  handleDeleteTask,
  handleMarkDone,
} = require('../../handlers/taskHandlers');
const { bot, userTasks } = require('../../data');

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(userTasks).forEach((key) => delete userTasks[key]);
});

describe('sendFeedbackMessage', () => {
  it('should send feedback instructions to the user', () => {
    sendFeedbackMessage(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '👉 Будь ласка, введи команду /feedback, щоб написати відгук.',
    );
  });
});

describe('sendCommandsList', () => {
  it('should send the list of commands', () => {
    sendCommandsList(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining('Ось доступні команди:'),
    );
  });
});

describe('handleAddTask', () => {
  it('should add tasks to the userTasks array', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Test Task', chatId: 123 });
      }
    });

    handleAddTask(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      "Введи завдання, яке хочеш додати. Натисни кнопку 'Завершити додавання завдань', щоб зупинити.",
    );
    expect(userTasks[123]).toEqual([{ task: 'Test Task', done: false }]);
  });

  it('should stop adding tasks on exit command', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Завершити додавання завдань', chatId: 123 });
      }
    });

    handleAddTask(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '✅ Завершено процес додавання завдань.',
    );
  });
});

describe('handleViewTasks', () => {
  it('should notify if the user has no tasks', () => {
    userTasks[123] = [];
    handleViewTasks(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❗ У тебе немає завдань.',
    );
  });
});

describe('handleAddTask with edge cases', () => {
  it('should not add a task if no message is sent', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') {
        handler({ text: '', chatId: 123 });
      }
    });

    handleAddTask(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Завдання не було введено.',
    );
  });

  it('should handle repeated messages gracefully', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Test Task 1', chatId: 123 });
      }
    });

    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') {
        handler({ text: 'Test Task 2', chatId: 123 });
      }
    });

    handleAddTask(123);
    expect(userTasks[123]).toHaveLength(2);
    expect(userTasks[123][0]).toMatchObject({
      task: 'Test Task 1',
      done: false,
    });
    expect(userTasks[123][1]).toMatchObject({
      task: 'Test Task 2',
      done: false,
    });
  });
});

describe('handleMarkDone edge cases', () => {
  it('should not mark task done with invalid index', () => {
    userTasks[123] = [{ task: 'Test Task', done: false }];
    handleMarkDone(123, 'done 2');
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Помилка: завдання не знайдено.',
    );
  });

  it('should correctly handle marking task done with valid index', () => {
    userTasks[123] = [{ task: 'Task to mark', done: false }];
    handleMarkDone(123, 'done 1');
    expect(userTasks[123][0].done).toBe(true);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '✅ Завдання "Task to mark" позначено як виконане.',
    );
  });
});

describe('handleDeleteTask edge cases', () => {
  it('should delete the correct task when valid index is provided', () => {
    userTasks[123] = [{ task: 'Task to delete', done: false }];
    handleDeleteTask(123, 'delete 1');
    expect(userTasks[123]).toHaveLength(0);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '🗑️ Завдання "Task to delete" видалено.',
    );
  });

  it('should notify if invalid index is passed', () => {
    handleDeleteTask(123, 'delete 3');
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Помилка: завдання не знайдено.',
    );
  });
});

describe('sendCommandsList edge case', () => {
  it('should send command list correctly', () => {
    sendCommandsList(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining('Додати 📝'),
    );
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining('Переглянути 📋'),
    );
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining('Запланувати ⌛'),
    );
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      expect.stringContaining('Вийти'),
    );
  });
});

describe('sendFeedbackMessage edge case', () => {
  it('should send feedback message properly', () => {
    sendFeedbackMessage(123);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '👉 Будь ласка, введи команду /feedback, щоб написати відгук.',
    );
  });
});

describe('handleDeleteTask', () => {
  it('should delete a task by its number', () => {
    userTasks[123] = [{ task: 'Test Task', done: false }];
    handleDeleteTask(123, 'delete 1');
    expect(userTasks[123]).toHaveLength(0);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '🗑️ Завдання "Test Task" видалено.',
    );
  });

  it('should notify if task number is invalid', () => {
    handleDeleteTask(123, 'delete 1');
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Помилка: завдання не знайдено.',
    );
  });
});

describe('handleMarkDone', () => {
  it('should mark a task as done', () => {
    userTasks[123] = [{ task: 'Test Task', done: false }];
    handleMarkDone(123, 'done 1');
    expect(userTasks[123][0].done).toBe(true);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '✅ Завдання "Test Task" позначено як виконане.',
    );
  });

  it('should notify if task number is invalid', () => {
    handleMarkDone(123, 'done 1');
    expect(bot.sendMessage).toHaveBeenCalledWith(
      123,
      '❌ Помилка: завдання не знайдено.',
    );
  });
});