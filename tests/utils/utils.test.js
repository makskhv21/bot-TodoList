const { getTodayFormatted } = require('../../utils/utils');

describe('getTodayFormatted', () => {
  it('should return the correct formatted string for the current date', () => {
    const now = new Date();
    const days = [
      'Неділя',
      'Понеділок',
      'Вівторок',
      'Середа',
      'Четвер',
      'П’ятниця',
      'Субота',
    ];
    const expectedString = `${days[now.getDay()]} - ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} р.;`;

    expect(getTodayFormatted()).toBe(expectedString);
  });
});
