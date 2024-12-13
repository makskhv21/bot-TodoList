const { bot } = require('./data');
const { scheduleWeeklyReport } = require('./services/report');
const {
  checkScheduledTasks,
  scheduleTask,
  viewScheduledTasks,
} = require('./services/schedule');
const { autoDeleteOldTasks } = require('./services/autoCleanup');
const { delTask, doneTask } = require('./services/taskManager');
const { handleStart, handleFeedback } = require('./handlers/commandHandlers');
const {
  sendFeedbackMessage,
  sendCommandsList,
  handleAddTask,
  handleViewTasks,
  handleDeleteTask,
  handleMarkDone,
} = require('./handlers/taskHandlers');

setInterval(checkScheduledTasks, 60000);
scheduleWeeklyReport();
setInterval(autoDeleteOldTasks, 1 * 60 * 1000);

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const handleTextCommands = () => {
    if (text === 'Запланувати ⌛') scheduleTask(chatId);
    if (text === 'Відгук ✏️') sendFeedbackMessage(chatId);
    if (text === 'Команди 👨🏻‍💻') sendCommandsList(chatId);
    if (text === 'Додати 📝') handleAddTask(chatId);
    if (text === 'Переглянути 📋') handleViewTasks(chatId);
    if (text === 'Вийти') bot.sendMessage(chatId, 'Вихід з меню.');
  };

  handleTextCommands();

  const handleRegexActions = () => {
    const deleteMatch = text.match(/delTask (\d+)/);
    if (deleteMatch) {
      const index = parseInt(deleteMatch[1], 10) - 1;
      delTask(chatId, index);
    }

    const markDoneMatch = text.match(/doneTask (\d+)/);
    if (markDoneMatch) {
      const index = parseInt(markDoneMatch[1], 10) - 1;
      doneTask(chatId, index);
    }
  };

  handleRegexActions();

  if (text.startsWith('/feedback')) {
    bot.emit('text', msg);
  }

  if (text.startsWith('delete ')) {
    handleDeleteTask(chatId, text);
  }

  if (text.startsWith('done ')) {
    handleMarkDone(chatId, text);
  }

  if (msg.text === 'Переглянути 📋') {
    viewScheduledTasks(chatId);
  }
});

bot.onText(/\/start/, handleStart);
bot.onText(/\/feedback/, handleFeedback);
