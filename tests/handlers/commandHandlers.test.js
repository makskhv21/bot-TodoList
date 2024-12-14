const {
  handleStart,
  handleFeedback,
} = require('../../handlers/commandHandlers');
const { bot } = require('../../data');

jest.mock('../../data', () => ({
  bot: {
    sendMessage: jest.fn(),
  },
  developerChatId: 12345,
}));

jest.mock('../../keyboards/keyboards', () => ({
  mainMenuKeyboard: {
    reply_markup: {
      keyboard: ['keyboard-mock'],
    },
  },
}));

describe('handleStart', () => {
  it('should send welcome message with correct keyboard options', async () => {
    const msg = { chat: { id: 11111 } };

    await handleStart(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      expect.stringMatching(/Ласкаво просимо до TaskBot!/),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: ['keyboard-mock'],
        },
      },
    );
  });
});

describe('handleFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prompt user for feedback and send to developer if feedback is valid', async () => {
    const msg = { chat: { id: 11111 }, from: { username: 'testUser' } };

    bot.once = jest.fn((event, callback) => {
      callback({ text: 'Test feedback', from: { username: 'testUser' } });
    });

    await handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      '✅ Дякуємо за твій відгук! Ми передамо його розробнику. 😊',
    );

    expect(bot.sendMessage).toHaveBeenCalledWith(
      12345,
      expect.stringMatching(/Test feedback/),
    );
  });

  it('should handle the case where feedback is empty', async () => {
    const msg = { chat: { id: 11111 }, from: { username: 'testUser' } };

    bot.once = jest.fn((event, callback) => {
      callback({ text: '' });
    });

    await handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      '❌ Ти не ввів текст відгуку. Спробуй ще раз.',
    );
  });

  it('should handle feedback without username properly', async () => {
    const msg = { chat: { id: 11111 }, from: { id: 99999 } };

    bot.once = jest.fn((event, callback) => {
      callback({ text: 'Anonymous feedback', from: { id: 99999 } });
    });

    await handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      '✅ Дякуємо за твій відгук! Ми передамо його розробнику. 😊',
    );

    expect(bot.sendMessage).toHaveBeenCalledWith(
      12345,
      expect.stringMatching(/Anonymous feedback/),
    );
  });

  it('should handle feedback when no feedback text is provided', async () => {
    const msg = { chat: { id: 11111 }, from: { username: 'testUser' } };

    bot.once = jest.fn((event, callback) => {
      callback({ text: null });
    });

    await handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      '❌ Ти не ввів текст відгуку. Спробуй ще раз.',
    );
  });

  it('should send developer feedback if `response.text` is falsy', async () => {
    const msg = { chat: { id: 11111 }, from: { username: 'testUser' } };

    bot.once = jest.fn((event, callback) => {
      callback({ text: undefined });
    });

    await handleFeedback(msg);

    expect(bot.sendMessage).toHaveBeenCalledWith(
      11111,
      '❌ Ти не ввів текст відгуку. Спробуй ще раз.',
    );
  });
});