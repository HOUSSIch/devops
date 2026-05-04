import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

describe('RemindersController', () => {
  let controller: RemindersController;

  const remindersServiceMock = {
    getMyReminders: jest.fn(),
    createReminder: jest.fn(),
    updateReminder: jest.fn(),
    deleteReminder: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [{ provide: RemindersService, useValue: remindersServiceMock }],
    }).compile();

    controller = module.get(RemindersController);
  });

  it('returns the current user reminders', async () => {
    remindersServiceMock.getMyReminders.mockResolvedValue([{ id: 'r1' }]);

    await expect(controller.getMyReminders({ user: { sub: 'kc-1' } })).resolves.toEqual([
      { id: 'r1' },
    ]);
  });

  it('creates a reminder for the current user', async () => {
    remindersServiceMock.createReminder.mockResolvedValue({ id: 'r1' });

    await expect(
      controller.createReminder({ user: { sub: 'kc-1' } }, { title: 'x' }),
    ).resolves.toEqual({ id: 'r1' });
  });

  it('updates a reminder for the current user', async () => {
    remindersServiceMock.updateReminder.mockResolvedValue({ id: 'r1' });

    await expect(
      controller.updateReminder({ user: { sub: 'kc-1' } }, 'r1', { title: 'x' }),
    ).resolves.toEqual({ id: 'r1' });
  });

  it('deletes a reminder for the current user', async () => {
    remindersServiceMock.deleteReminder.mockResolvedValue({ success: true });

    await expect(
      controller.deleteReminder({ user: { sub: 'kc-1' } }, 'r1'),
    ).resolves.toEqual({ success: true });
  });
});