const { mainMenuKeyboard, addTaskKeyboard } = require('../keyboards/keyboards');
const { getTodayFormatted } = require('../utils/utils');
const { userTasks, bot } = require('../data');

function showMainMenu(chatId) {
  bot.sendMessage(chatId, "Головне меню:", {
    reply_markup: mainMenuKeyboard.reply_markup,
  });
}

function sendFeedbackMessage(chatId) {
  bot.sendMessage(
    chatId,
    "👉 Будь ласка, введи команду /feedback, щоб написати відгук."
  );
}
  
function sendCommandsList(chatId) {
  const responseMessage = `Ось доступні команди: ✔️ 
  - 'Додати 📝' - Додати нове завдання.
  - 'Переглянути 📋' - Переглянути список завдань.
  - 'Запланувати ⌛' - Запланувати завдання.
  - 'Вийти' - Вихід з бота.`;

  bot.sendMessage(chatId, responseMessage);
}
  
function handleAddTask(chatId) {
  bot.sendMessage(
    chatId,
    "Введи завдання, яке хочеш додати. Натисни кнопку 'Завершити додавання завдань', щоб зупинити."
  );

  bot.sendMessage(chatId, "Тепер вводь завдання:", {
    reply_markup: addTaskKeyboard.reply_markup,
  });

  bot.once('message', function handleTask(response) {
    if (response.text === 'Завершити додавання завдань') {
      bot.sendMessage(chatId, "✅ Завершено процес додавання завдань.");
      showMainMenu(chatId);
      return;
    }

    if (response.text) {
      userTasks[chatId] = userTasks[chatId] || [];
      userTasks[chatId].push({ task: response.text, done: false });
      bot.sendMessage(chatId, `✅ Завдання "${response.text}" додано до списку.`);
      bot.once('message', handleTask);
    } else {
      bot.sendMessage(chatId, "❌ Завдання не було введено.");
    }
  });
}
  
function handleViewTasks(chatId) {
  if (!userTasks[chatId] || userTasks[chatId].length === 0) {
    bot.sendMessage(chatId, "❗ У тебе немає завдань.");
    return;
  }
  
  const today = getTodayFormatted();
  const taskListMessage = userTasks[chatId]
    .map(
      (task, index) => `${index + 1}. ${task.done ? '✅' : '❌'} ${task.task}`
    )
    .join('\n');

  bot.sendMessage(
    chatId,
    `${today}\n*Ось твій список завдань:*\n${taskListMessage}\n\nВведи:\n- 'done <номер>', щоб позначити виконане.\n- 'delete <номер>', щоб видалити.`,
    { parse_mode: 'Markdown' }
  );
}
  
function handleDeleteTask(chatId, msgText) {
  const taskNumber = parseInt(msgText.split(' ')[1]) - 1;
  if (userTasks[chatId] && userTasks[chatId][taskNumber]) {
    const removedTask = userTasks[chatId].splice(taskNumber, 1);
    bot.sendMessage(chatId, `🗑️ Завдання "${removedTask[0].task}" видалено.`);
  } else {
    bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
  }
}
  
function handleMarkDone(chatId, msgText) {
  const taskNumber = parseInt(msgText.split(' ')[1]) - 1;
  if (userTasks[chatId] && userTasks[chatId][taskNumber]) {
    userTasks[chatId][taskNumber].done = true;
    bot.sendMessage(chatId, `✅ Завдання "${userTasks[chatId][taskNumber].task}" позначено як виконане.`);
  } else {
    bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
  }
}

module.exports = {
  sendFeedbackMessage,
  sendCommandsList,
  handleAddTask,
  handleViewTasks,
  handleDeleteTask,
  handleMarkDone
}