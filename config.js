require('dotenv').config();

module.exports = {
    token: process.env.TELEGRAM_TOKEN,
    developerChatId: process.env.DEVELOPER_CHAT_ID,
};