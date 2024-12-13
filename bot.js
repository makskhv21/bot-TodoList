require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const { token, developerChatId } = require('./config');

const bot = new TelegramBot(token, { polling: true });

const userTasks = {};
const scheduledTasks = [];

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ['Додати 📝', 'Переглянути 📋'], 
      ['Запланувати ⌛', 'Команди 👨🏻‍💻'], 
      ['Вийти'] 
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

const addTaskKeyboard = {
  reply_markup: {
    keyboard: [
      ['Завершити додавання завдань'],
    ],
    resize_keyboard: true,
  },
};

const scheduleTaskKeyboard = {
  reply_markup: {
    keyboard: [
      ['Планувати завдання з датою', 'Вийти'],
    ],
    resize_keyboard: true,
  },
};

function checkScheduledTasks() {
  const now = new Date();

  scheduledTasks.forEach((task, index) => {
    const taskTime = new Date(task.date);

    if (
      taskTime.getHours() === 9 &&
      taskTime.getMinutes() === 0 &&
      taskTime.getDate() === now.getDate() &&
      taskTime.getMonth() === now.getMonth() &&
      taskTime.getFullYear() === now.getFullYear()
    ) {
      bot.sendMessage(task.chatId, `⏰ Нагадування: ${task.task}`);
      scheduledTasks.splice(index, 1); 
    }
  });
}

setInterval(checkScheduledTasks, 60000);


function weeklyReport() {
  let totalTasks = 0;
  let completedTasks = 0;
  let scheduledCount = scheduledTasks.length;

  for (const userId in userTasks) {
    if (userTasks[userId]) {
      totalTasks += userTasks[userId].length;
      completedTasks += userTasks[userId].filter(task => task.done).length;
    }
  }

  const reportMessage = `📊 Звіт за поточний тиждень:
  - Загальна кількість завдань: ${totalTasks}
  - Кількість виконаних завдань: ${completedTasks}
  - Кількість запланованих завдань: ${scheduledCount}`;

  for (const userId in userTasks) {
    bot.sendMessage(userId, reportMessage);
  }
}

function scheduleWeeklyReport() {
  const now = new Date();
  const nextMonday = new Date();
  
  nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7));
  nextMonday.setHours(12, 0, 0);

  const timeUntilNextReport = nextMonday - now;

  setTimeout(() => {
    weeklyReport();
    scheduleWeeklyReport(); 
  }, timeUntilNextReport);
}

scheduleWeeklyReport();

function autoDeleteYesterdayTasks() {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1); 

  for (const userId in userTasks) {
    if (userTasks[userId]) {
      userTasks[userId] = userTasks[userId].filter(task => {
        const taskDate = new Date(task.date);
        if (
          task.done && 
          taskDate.getDate() === yesterday.getDate() &&
          taskDate.getMonth() === yesterday.getMonth() &&
          taskDate.getFullYear() === yesterday.getFullYear()
        ) {
          bot.sendMessage(userId, `🗑️ Завдання "${task.task}" було автоматично видалено.`);
          return false; 
        }
        return true;
      });
    }
  }

  for (let i = scheduledTasks.length - 1; i >= 0; i--) {
    const task = scheduledTasks[i];
    const taskDate = new Date(task.date);

    if (
      task.done &&
      taskDate.getDate() === yesterday.getDate() &&
      taskDate.getMonth() === yesterday.getMonth() &&
      taskDate.getFullYear() === yesterday.getFullYear()
    ) {
      bot.sendMessage(task.chatId, `🗑️ Заплановане завдання "${task.task}" було автоматично видалено.`);
      scheduledTasks.splice(i, 1);
    }
  }
}

setInterval(autoDeleteYesterdayTasks, 1 * 60 * 1000);

function showMainMenu(chatId) {
  bot.sendMessage(chatId, "Головне меню:", {
    reply_markup: mainMenuKeyboard.reply_markup,
  });
}

function getTodayFormatted() {
  const now = new Date();
  const days = [
    'неділя',
    'понеділок',
    'вівторок',
    'середа',
    'четвер',
    'п’ятниця',
    'субота',
  ];
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return `${day} - ${date}.${month}.${year} р.;`;
}

function scheduleTask(chatId) {
  bot.sendMessage(
    chatId,
    "Введи завдання у форматі: Текст завдання - Дата (наприклад: Завдання на тренування - 2024.12.08):"
  );

  bot.once('message', function handleTask(response) {
    if (response.text === 'Вийти') {
      bot.sendMessage(chatId, "Відмінено планування завдання.");
      return;
    }

    const regex = /(.+)\s*-\s*(\d{4}\.\d{2}\.\d{2})/;
    const match = response.text.match(regex);

    if (!match) {
      bot.sendMessage(chatId, "❌ Невірний формат. Спробуй ще раз.");
      return;
    }

    const taskText = match[1].trim();
    const dateString = match[2];
    const scheduledDate = new Date(dateString);

    if (isNaN(scheduledDate.getTime())) {
      bot.sendMessage(chatId, "❌ Невірна дата. Спробуй ще раз.");
      return;
    }

    scheduledTasks.push({
      chatId,
      task: taskText,
      date: scheduledDate,
    });

    bot.sendMessage(
      chatId,
      `✅ Завдання "${taskText}" заплановано на ${scheduledDate.toDateString()}.`
    );
  });
}

function viewScheduledTasks(chatId) {
  if (scheduledTasks.length === 0) {
    bot.sendMessage(chatId, "❗ У тебе немає запланованих завдань.");
  } else {
    const taskListMessage = scheduledTasks
      .map(
        (task, index) => `${index + 1}. ${task.task} - ${task.date.toDateString()}`
      )
      .join('\n');

    bot.sendMessage(
      chatId,
      `Ось твій список запланованих завдань:\n${taskListMessage}\n\nВведи:\n- 'delTask <номер>' - видалення .\n- 'doneTask <номер>' - виконане.`,
    );
  }
}

function delTask(chatId, index) {
  if (index >= 0 && index < scheduledTasks.length) {
    const removedTask = scheduledTasks.splice(index, 1);
    bot.sendMessage(chatId, `🗑️ Завдання "${removedTask[0].task}" було видалено.`);
  } else {
    bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
  }
}

function doneTask(chatId, index) {
  if (index >= 0 && index < scheduledTasks.length) {
    const task = scheduledTasks[index];
    task.done = true;
    bot.sendMessage(chatId, `✅ Завдання "${task.task}" позначено як виконане.`);
  } else {
    bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🌟 *Ласкаво просимо до TaskBot!* 🤖\n\n
    Я твій помічник у плануванні завдань. Ось що я можу зробити для тебе:\n\n
    ✅ Додати завдання до списку.\n
    📋 Переглядати завдання.\n
    ⏳ Заплановувати нагадування.\n
    📊 Створювати звіти про виконані завдання щотижня.\n\n
    Готовий почати? Натисни кнопку нижче та обери потрібну опцію! 👇`,
    { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard.reply_markup }
  );
});



bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === 'Запланувати ⌛') {
    scheduleTask(chatId);
  }

  if (msg.text === 'Переглянути 📋') {
    viewScheduledTasks(chatId);
  }

  const deleteMatch = msg.text.match(/delTask (\d+)/);
  if (deleteMatch) {
    const index = parseInt(deleteMatch[1], 10) - 1;
    delTask(chatId, index);
    return;
  }

  const markDoneMatch = msg.text.match(/doneTask (\d+)/);
  if (markDoneMatch) {
    const index = parseInt(markDoneMatch[1], 10) - 1;
    doneTask(chatId, index);
    return;
  }

  if (msg.text === 'Команди 👨🏻‍💻') {
    const responseMessage = `*Ось доступні команди:* ✔️ 
    - 'Додати 📝' - Додати нове завдання.
    - 'Переглянути 📋' - Переглянути список завдань.
    - 'Запланувати ⌛' - Запланувати завдання.
    - 'Вийти' - Вихід з бота.

    💡 Якщо у вас є рекомендації або відгуки, напишіть їх у відповідь на це повідомлення.`;
    
    bot.sendMessage(chatId, responseMessage);
    
    // Очікуємо відгук
    bot.once('message', (response) => {
      if (response.text) {
        bot.sendMessage(
          chatId,
          'Дякуємо за ваш відгук! Ми передамо його розробнику. 😊'
        );

        // Надсилання відгуку розробнику
        bot.sendMessage(
          developerChatId,
          `📩 Новий відгук від користувача ${response.from.username || response.from.id}:\n"${response.text}"`
        );
      }
    });
  }

  if (msg.text === 'Додати 📝') {
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


  if (msg.text === 'Переглянути 📋') {
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


  if (msg.text.startsWith('delete ')) {
    const taskNumber = parseInt(msg.text.split(' ')[1]) - 1;
    if (userTasks[chatId] && userTasks[chatId][taskNumber]) {
      const removedTask = userTasks[chatId].splice(taskNumber, 1);
      bot.sendMessage(chatId, `🗑️ Завдання "${removedTask[0].task}" видалено.`);
    } else {
      bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
    }
  }


  if (msg.text.startsWith('done ')) {
    const taskNumber = parseInt(msg.text.split(' ')[1]) - 1;
    if (userTasks[chatId] && userTasks[chatId][taskNumber]) {
      userTasks[chatId][taskNumber].done = true;
      bot.sendMessage(chatId, `✅ Завдання "${userTasks[chatId][taskNumber].task}" позначено як виконане.`);
    } else {
      bot.sendMessage(chatId, "❌ Помилка: завдання не знайдено.");
    }
  }

  if (msg.text === 'Вийти') {
    bot.sendMessage(chatId, "Вихід з меню.");
  }
});