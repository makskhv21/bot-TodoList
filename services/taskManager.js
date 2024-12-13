const { scheduledTasks, bot } = require('../data');

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

module.exports = {
    delTask,
    doneTask
}