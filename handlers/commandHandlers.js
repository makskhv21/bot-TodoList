const { bot, developerChatId } = require('../data');
const { mainMenuKeyboard } = require('../keyboards/keyboards');

function handleStart(msg) {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🌟 *Ласкаво просимо до TaskBot!* 🤖\n
    Я твій помічник у плануванні завдань. Ось що я можу зробити для тебе:\n
    ✅ Додати завдання до списку.\n
    📋 Переглядати завдання.\n
    ⏳ Заплановувати нагадування.\n
    📊 Створювати звіти про виконані завдання щотижня.\n
    Готовий почати? Натисни кнопку нижче та обери потрібну опцію! 👇`,
    { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard.reply_markup },
  );
}

function handleFeedback(msg) {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    '📝 Введи текст відгуку. Після написання відправ його, і ми передамо його розробнику.',
  );

  bot.once('message', (response) => {
    if (response.text) {
      bot.sendMessage(
        chatId,
        '✅ Дякуємо за твій відгук! Ми передамо його розробнику. 😊',
      );

      bot.sendMessage(
        developerChatId,
        `📩 Новий відгук від користувача ${response.from.username || response.from.id}:\n"${response.text}"`,
      );
    } else {
      bot.sendMessage(chatId, '❌ Ти не ввів текст відгуку. Спробуй ще раз.');
    }
  });
}

module.exports = {
  handleStart,
  handleFeedback,
};
