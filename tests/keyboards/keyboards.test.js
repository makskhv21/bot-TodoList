const {
  mainMenuKeyboard,
  addTaskKeyboard,
} = require('../../keyboards/keyboards');

describe('Keyboard configurations', () => {
  it('should have the correct structure for mainMenuKeyboard', () => {
    expect(mainMenuKeyboard).toHaveProperty('reply_markup');
    expect(mainMenuKeyboard.reply_markup).toHaveProperty('keyboard');
    expect(mainMenuKeyboard.reply_markup.keyboard).toEqual([
      ['Додати 📝', 'Переглянути 📋'],
      ['Запланувати ⌛', 'Команди 👨🏻‍💻'],
      ['Відгук ✏️', 'Вийти'],
    ]);
  });

  it('should have the correct structure for addTaskKeyboard', () => {
    expect(addTaskKeyboard).toHaveProperty('reply_markup');
    expect(addTaskKeyboard.reply_markup).toHaveProperty('keyboard');
    expect(addTaskKeyboard.reply_markup.keyboard).toEqual([
      ['Завершити додавання завдань'],
    ]);
  });

  it('should have resize_keyboard set to true for both keyboards', () => {
    expect(mainMenuKeyboard.reply_markup.resize_keyboard).toBe(true);
    expect(addTaskKeyboard.reply_markup.resize_keyboard).toBe(true);
  });

  it('should have one_time_keyboard set correctly for mainMenuKeyboard', () => {
    expect(mainMenuKeyboard.reply_markup.one_time_keyboard).toBe(true);
  });
});
