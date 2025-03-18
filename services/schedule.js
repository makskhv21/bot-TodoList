const { scheduledTasks, bot } = require('../data');

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

function scheduleTask(chatId) {
  bot.sendMessage(
    chatId,
    'Введи завдання у форматі: Текст завдання - Дата (наприклад: Завдання на тренування - 2024.12.08):',
  );

  bot.once('message', function handleTask(response) {
    if (response.text === 'Вийти') {
      bot.sendMessage(chatId, 'Відмінено планування завдання.');
      return;
    }

    const regex = /^([^-\n]+?)\s*-\s*(\d{4}\.\d{2}\.\d{2})$/;
    const match = response.text.match(regex);

    if (!match) {
      bot.sendMessage(chatId, '❌ Невірний формат. Спробуй ще раз.');
      return;
    }

    const taskText = match[1].trim();
    const dateString = match[2];
    const scheduledDate = new Date(dateString);

    if (isNaN(scheduledDate.getTime())) {
      bot.sendMessage(chatId, '❌ Невірна дата. Спробуй ще раз.');
      return;
    }

    scheduledTasks.push({
      chatId,
      task: taskText,
      date: scheduledDate,
    });

    bot.sendMessage(
      chatId,
      `✅ Завдання "${taskText}" заплановано на ${scheduledDate.toDateString()}.`,
    );
  });
}

function viewScheduledTasks(chatId) {
  if (scheduledTasks.length === 0) {
    bot.sendMessage(chatId, '❗ У тебе немає запланованих завдань.');
  } else {
    const taskListMessage = scheduledTasks
      .map(
        (task, index) =>
          `${index + 1}. ${task.done ? '✅' : '❌'} ${task.task} - ${task.date.toDateString()}`,
      )
      .join('\n');

    bot.sendMessage(
      chatId,
      `Ось твій список запланованих завдань:\n${taskListMessage}\n\nВведи:\n- 'delTask <номер>' - видалення .\n- 'doneTask <номер>' - виконане.`,
    );
  }
}

module.exports = {
  checkScheduledTasks,
  scheduleTask,
  viewScheduledTasks,
};
