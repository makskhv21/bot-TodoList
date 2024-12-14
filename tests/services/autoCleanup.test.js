const { autoDeleteOldTasks } = require('../../services/autoCleanup');
const { scheduledTasks, userTasks, bot } = require('../../data');

jest.mock('../../data', () => {
  const now = Date.now();
  const scheduledTasksMock = [
    {
      chatId: 123,
      date: new Date(now - 100000).toISOString(),
      task: 'Old Task 1',
    },
    {
      chatId: 124,
      date: new Date(now + 100000).toISOString(),
      task: 'Future Task',
    },
  ];

  const userTasksMock = {
    123: [
      { date: new Date(now - 100000).toISOString(), task: 'User Old Task' },
      { date: new Date(now + 100000).toISOString(), task: 'User Future Task' },
    ],
    124: [
      {
        date: new Date(now - 500000).toISOString(),
        task: 'User Another Old Task',
      },
    ],
  };

  const botMock = {
    sendMessage: jest.fn(),
  };

  return {
    scheduledTasks: scheduledTasksMock,
    userTasks: userTasksMock,
    bot: botMock,
  };
});

function setupState() {
  scheduledTasks.length = 0;
  scheduledTasks.push(
    {
      chatId: 123,
      date: new Date(Date.now() - 100000).toISOString(),
      task: 'Old Task 1',
    },
    {
      chatId: 124,
      date: new Date(Date.now() + 100000).toISOString(),
      task: 'Future Task',
    },
  );

  userTasks[123] = [
    {
      date: new Date(Date.now() - 100000).toISOString(),
      task: 'User Old Task',
    },
    {
      date: new Date(Date.now() + 100000).toISOString(),
      task: 'User Future Task',
    },
  ];
  userTasks[124] = [
    {
      date: new Date(Date.now() - 500000).toISOString(),
      task: 'User Another Old Task',
    },
  ];
}

describe('autoDeleteOldTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupState();
  });

  it('should retain tasks that are not old', () => {
    autoDeleteOldTasks();
    expect(
      scheduledTasks.some((task) => task.task === 'Future Task'),
    ).toBeTruthy();
    expect(
      userTasks[123].some((task) => task.task === 'User Future Task'),
    ).toBeTruthy();
  });

  it('should work at the 23:59:59 edge boundary correctly', () => {
    const now = new Date();
    const edgeCaseTime = new Date(now);
    edgeCaseTime.setHours(23, 59, 59, 999);

    scheduledTasks.push({
      chatId: 123,
      date: edgeCaseTime.toISOString(),
      task: 'Edge Case Task',
    });
    userTasks[123] = [
      { date: edgeCaseTime.toISOString(), task: 'User Edge Case Task' },
    ];

    autoDeleteOldTasks();

    expect(
      scheduledTasks.some((task) => task.task === 'Edge Case Task'),
    ).toBeTruthy();
    expect(
      userTasks[123].some((task) => task.task === 'User Edge Case Task'),
    ).toBeTruthy();
  });

  it('should not fail when userTasks or scheduledTasks are empty', () => {
    scheduledTasks.length = 0;
    userTasks[123] = [];

    autoDeleteOldTasks();
    expect(bot.sendMessage).not.toHaveBeenCalled();
  });

  it('should not send unnecessary messages if all tasks are in the future', () => {
    scheduledTasks.length = 0;
    scheduledTasks.push({
      chatId: 123,
      date: new Date(Date.now() + 100000).toISOString(),
      task: 'Only Future Task',
    });
    userTasks[123] = [
      {
        date: new Date(Date.now() + 100000).toISOString(),
        task: 'Only Future User Task',
      },
    ];

    autoDeleteOldTasks();

    expect(bot.sendMessage).not.toHaveBeenCalled();
    expect(scheduledTasks.length).toBe(1);
    expect(userTasks[123].length).toBe(1);
  });
});
