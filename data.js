const { token } = require('./config');

const TelegramBot = require('node-telegram-bot-api');
const userTasks = {};
const scheduledTasks = [];
const bot = new TelegramBot(token, { polling: true });

module.exports = {
  TelegramBot,
  userTasks,
  scheduledTasks,
  bot,
};
