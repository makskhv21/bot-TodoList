const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ['Додати 📝', 'Переглянути 📋'],
      ['Запланувати ⌛', 'Команди 👨🏻‍💻'],
      ['Відгук ✏️', 'Вийти'],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

const addTaskKeyboard = {
  reply_markup: {
    keyboard: [['Завершити додавання завдань']],
    resize_keyboard: true,
  },
};

module.exports = {
  mainMenuKeyboard,
  addTaskKeyboard,
};
