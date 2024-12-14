const { bot } = require('../data');
const { handleStart, handleFeedback } = require('../handlers/commandHandlers');
const {
  handleAddTask,
  handleViewTasks,
  handleDeleteTask,
  handleMarkDone,
} = require('../handlers/taskHandlers');
const { mainMenuKeyboard } = require('../keyboards/keyboards');

jest.mock('node-telegram-bot-api');

describe('TaskBot End-to-End Tests', () => {
  let chatId;

  beforeEach(() => {
    chatId = 12345678;
    bot.sendMessage.mockClear();
  });

  test('Should send welcome message and main menu options when /start is called', () => {
    const msg = { chat: { id: chatId } };
    handleStart(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Ласкаво просимо до TaskBot!'),
      expect.objectContaining({
        reply_markup: mainMenuKeyboard.reply_markup,
      }),
    );
  });

  test('Should ask for feedback when /feedback is called', () => {
    const msg = { chat: { id: chatId }, text: '/feedback' };
    handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '📝 Введи текст відгуку. Після написання відправ його, і ми передамо його розробнику.',
    );
  });

  test('Should add a task to the list when the user submits a task', () => {
    const taskMessage = { chat: { id: chatId }, text: 'My new task' };
    handleAddTask(chatId);

    bot.once.mockImplementationOnce((event, callback) => {
      if (event === 'message') {
        callback(taskMessage);
      }
    });

    handleAddTask(chatId);
    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '✅ Завдання "My new task" додано до списку.',
    );
  });

  test('Should display task list when /viewTasks is called', () => {
    // const userTasks = { [chatId]: [{ task: 'My new task', done: false }] };
    // const msg = { chat: { id: chatId }, text: '/viewTasks' };
    handleViewTasks(chatId);

    // const taskListMessage = '1. ❌ My new task';
    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Ось твій список завдань:'),
      expect.objectContaining({
        parse_mode: 'Markdown',
      }),
    );
  });

  test('Should mark a task as done when user provides the correct command', () => {
    const taskMessage = { chat: { id: chatId }, text: 'done 1' };
    handleMarkDone(chatId, taskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '✅ Завдання "My new task" позначено як виконане.',
    );
  });

  test('Should delete a task when user provides the correct command', () => {
    const taskMessage = { chat: { id: chatId }, text: 'delete 1' };
    handleDeleteTask(chatId, taskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '🗑️ Завдання "My new task" видалено.',
    );
  });

  test('Should return error if no task is found when deleting', () => {
    const taskMessage = { chat: { id: chatId }, text: 'delete 999' };
    handleDeleteTask(chatId, taskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Помилка: завдання не знайдено.',
    );
  });

  test('Should handle invalid task index when marking as done', () => {
    const invalidTaskMessage = { chat: { id: chatId }, text: 'done 999' };
    handleMarkDone(chatId, invalidTaskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Помилка: завдання не знайдено.',
    );
  });

  test('Should handle invalid task index when deleting', () => {
    const invalidTaskMessage = { chat: { id: chatId }, text: 'delete 999' };
    handleDeleteTask(chatId, invalidTaskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Помилка: завдання не знайдено.',
    );
  });

  test('Should handle empty task list when viewing tasks', () => {
    // const emptyUserTasks = { [chatId]: [] };
    // const msg = { chat: { id: chatId }, text: '/viewTasks' };
    handleViewTasks(chatId);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❗ У тебе немає завдань.',
    );
  });

  test('Should handle error when trying to mark a task done that does not exist', () => {
    const invalidTaskMessage = { chat: { id: chatId }, text: 'done 999' };
    handleMarkDone(chatId, invalidTaskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Помилка: завдання не знайдено.',
    );
  });

  test('Should return a message when /start is called by a different chat ID', () => {
    const newChatId = 87654321;
    const msg = { chat: { id: newChatId } };
    handleStart(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      newChatId,
      expect.stringContaining('Ласкаво просимо до TaskBot!'),
      expect.objectContaining({
        reply_markup: mainMenuKeyboard.reply_markup,
      }),
    );
  });

  test('Should handle invalid task number when marking task as done with non-numeric input', () => {
    const invalidTaskMessage = { chat: { id: chatId }, text: 'done abc' };
    handleMarkDone(chatId, invalidTaskMessage.text);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Помилка: завдання не знайдено.',
    );
  });
});
