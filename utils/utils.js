function getTodayFormatted() {
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
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${day} - ${date}.${month}.${year} р.;`;
}
  
module.exports = { getTodayFormatted };