const { scheduleWeeklyReport } = require('../../services/report');

jest.mock('../../data', () => {
  const mockBot = {
    sendMessage: jest.fn(),
  };

  const mockUserTasks = {
    1: [{ done: true }, { done: false }, { done: true }],
    2: [{ done: true }, { done: true }],
  };

  const mockScheduledTasks = [{ chatId: 123 }, { chatId: 456 }];

  return {
    bot: mockBot,
    userTasks: mockUserTasks,
    scheduledTasks: mockScheduledTasks,
  };
});

let timeoutMock;

beforeEach(() => {
  jest.clearAllMocks();
  timeoutMock = jest.spyOn(global, 'setTimeout');
  jest.useFakeTimers();
});

afterEach(() => {
  timeoutMock.mockRestore();
  jest.useRealTimers();
});

describe('scheduleWeeklyReport', () => {
  let timeoutMock;

  beforeEach(() => {
    jest.clearAllMocks();
    timeoutMock = jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    timeoutMock.mockRestore();
  });

  it('should calculate the timeout until the next Monday at 12 PM and call setTimeout', () => {
    scheduleWeeklyReport();

    expect(timeoutMock).toHaveBeenCalled();
  });
});