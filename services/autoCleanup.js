const { scheduledTasks, bot, userTasks } = require('../data');

function autoDeleteOldTasks() {
  const now = new Date();

  for (let i = scheduledTasks.length - 1; i >= 0; i--) {
    const task = scheduledTasks[i];
    const taskTime = new Date(task.date);

    if (taskTime.setHours(23, 59, 59, 999) < now.getTime()) {
      bot.sendMessage(
        task.chatId,
        `🗑️ Завдання "${task.task}" було автоматично видалено.`,
      );
      scheduledTasks.splice(i, 1);
    }
  }

  for (const userId in userTasks) {
    if (userTasks[userId]) {
      userTasks[userId] = userTasks[userId].filter((task) => {
        const taskTime = new Date(task.date);

        if (taskTime.setHours(23, 59, 59, 999) < now.getTime()) {
          bot.sendMessage(
            userId,
            `🗑️ Завдання "${task.task}" було автоматично видалено.`,
          );
          return false;
        }
        return true;
      });
    }
  }
}

module.exports = {
  autoDeleteOldTasks,
};
