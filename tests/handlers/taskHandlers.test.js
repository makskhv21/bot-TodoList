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

const sendMessageSpy = (userId, message) => {
  expect(bot.sendMessage).toHaveBeenCalledWith(userId, message);
};

describe('sendFeedbackMessage', () => {
  it('should send feedback instructions to the user', () => {
    sendFeedbackMessage(123);
    sendMessageSpy(123, '👉 Будь ласка, введи команду /feedback, щоб написати відгук.');
  });
});

describe('sendCommandsList', () => {
  it('should send the list of commands', () => {
    sendCommandsList(123);
    sendMessageSpy(123, expect.stringContaining('Ось доступні команди:'));
  });
});

describe('handleAddTask', () => {
  it('should add tasks to the userTasks array', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') handler({ text: 'Test Task', chatId: 123 });
    });
    handleAddTask(123);
    sendMessageSpy(123, "Введи завдання, яке хочеш додати. Натисни кнопку 'Завершити додавання завдань', щоб зупинити.");
    expect(userTasks[123]).toEqual([{ task: 'Test Task', done: false }]);
  });

  it('should stop adding tasks on exit command', () => {
    bot.once.mockImplementationOnce((event, handler) => {
      if (event === 'message') handler({ text: 'Завершити додавання завдань', chatId: 123 });
    });
    handleAddTask(123);
    sendMessageSpy(123, '✅ Завершено процес додавання завдань.');
  });
});

describe('handleViewTasks', () => {
  it('should notify if the user has no tasks', () => {
    userTasks[123] = [];
    handleViewTasks(123);
    sendMessageSpy(123, '❗ У тебе немає завдань.');
  });
});

describe('handleMarkDone', () => {
  it('should mark a task as done', () => {
    userTasks[123] = [{ task: 'Test Task', done: false }];
    handleMarkDone(123, 'done 1');
    expect(userTasks[123][0].done).toBe(true);
    sendMessageSpy(123, '✅ Завдання "Test Task" позначено як виконане.');
  });

  it('should notify if task number is invalid', () => {
    handleMarkDone(123, 'done 2');
    sendMessageSpy(123, '❌ Помилка: завдання не знайдено.');
  });
});

describe('handleDeleteTask', () => {
  it('should delete a task by its number', () => {
    userTasks[123] = [{ task: 'Test Task', done: false }];
    handleDeleteTask(123, 'delete 1');
    expect(userTasks[123]).toHaveLength(0);
    sendMessageSpy(123, '🗑️ Завдання "Test Task" видалено.');
  });

  it('should notify if task number is invalid', () => {
    handleDeleteTask(123, 'delete 3');
    sendMessageSpy(123, '❌ Помилка: завдання не знайдено.');
  });
});
