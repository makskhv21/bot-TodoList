const { scheduledTasks, bot, userTasks } = require('../data');

function weeklyReport() {
  let totalTasks = 0;
  let completedTasks = 0;
  let scheduledCount = scheduledTasks.length;

  for (const userId in userTasks) {
    if (userTasks[userId]) {
      totalTasks += userTasks[userId].length;
      completedTasks += userTasks[userId].filter((task) => task.done).length;
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

module.exports = { scheduleWeeklyReport, weeklyReport };
