import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service (1)';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatbotController', () => {
  let controller: ChatbotController;

  const chatbotServiceMock = {
    processMessage: jest.fn(),
  } as any;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    conversation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        { provide: ChatbotService, useValue: chatbotServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get(ChatbotController);
  });

  it('rejects empty messages', async () => {
    await expect(
      controller.sendMessage({ message: '   ' }, { user: { sub: 'kc-1' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects sendMessage when token has no subject', async () => {
    await expect(controller.sendMessage({ message: 'hello' }, { user: {} })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects sendMessage when user is missing in db', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      controller.sendMessage({ message: 'hello' }, { user: { sub: 'kc-1' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forwards valid sendMessage requests to chatbot service', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    chatbotServiceMock.processMessage.mockResolvedValue({ conversationId: 'c1' });

    await expect(
      controller.sendMessage({ message: 'hello', conversationId: 'c1' }, { user: { sub: 'kc-1' } }),
    ).resolves.toEqual({ conversationId: 'c1' });

    expect(chatbotServiceMock.processMessage).toHaveBeenCalledWith('u1', 'hello', 'c1');
  });

  it('rejects getConversations when token has no user id', async () => {
    await expect(controller.getConversations({ user: {} })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects getConversations when database user is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(controller.getConversations({ user: { sub: 'kc-1' } })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns conversations for authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.conversation.findMany.mockResolvedValue([{ id: 'c1' }]);

    await expect(controller.getConversations({ user: { sub: 'kc-1' } })).resolves.toEqual([
      { id: 'c1' },
    ]);

    expect(prismaMock.conversation.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('rejects getConversation when conversation does not exist for user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.conversation.findFirst.mockResolvedValue(null);

    await expect(controller.getConversation({ user: { sub: 'kc-1' } }, 'c404')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns one conversation by id for authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
    prismaMock.conversation.findFirst.mockResolvedValue({ id: 'c1', messages: [] });

    await expect(controller.getConversation({ user: { sub: 'kc-1' } }, 'c1')).resolves.toEqual({
      id: 'c1',
      messages: [],
    });
  });
});
