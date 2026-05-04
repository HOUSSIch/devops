import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service (1)';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  const geminiServiceMock = {
    generateTextResponse: jest.fn(),
  } as any;

  const prismaMock = {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    analysis: {
      findFirst: jest.fn(),
    },
    reminder: {
      findMany: jest.fn(),
    },
    skinQuestionnaire: {
      findUnique: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: GeminiService, useValue: geminiServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ChatbotService);
  });

  it('creates a new conversation when no conversation is found', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue({
      id: 'conv-1',
      messages: [],
    });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockResolvedValue('AI answer');

    const result = await service.processMessage('user-1', 'Hello AI');

    expect(prismaMock.conversation.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', messages: [] },
    });
    expect(prismaMock.conversation.update).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      conversationId: 'conv-1',
      message: { role: 'assistant', content: 'AI answer' },
      userMessage: { role: 'user', content: 'Hello AI' },
    });
  });

  it('uses existing conversation when conversationId belongs to the user', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'conv-existing',
      messages: [{ role: 'assistant', content: 'Old', timestamp: new Date() }],
    });
    prismaMock.analysis.findFirst.mockResolvedValue({
      skinType: 'Dry',
      healthScore: 80,
      skinAge: 30,
      summary: 'ok',
      concerns: [],
      morningRoutine: [],
      eveningRoutine: [],
    });
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue({
      skinType: 'Sensitive',
      concerns: ['Acne'],
      symptoms: ['Itch'],
    });
    geminiServiceMock.generateTextResponse.mockResolvedValue('Follow-up answer');

    const result = await service.processMessage('user-1', 'Need help', 'conv-existing');

    expect(prismaMock.conversation.create).not.toHaveBeenCalled();
    expect(prismaMock.conversation.findFirst).toHaveBeenCalledWith({
      where: { id: 'conv-existing', userId: 'user-1' },
    });
    expect(result.conversationId).toBe('conv-existing');
  });

  it('includes questionnaire fallback text when user has no questionnaire', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({ id: 'c1', messages: [] });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockResolvedValue('A');

    await service.processMessage('u1', 'Question', 'c1');

    const prompt = geminiServiceMock.generateTextResponse.mock.calls[0][0] as string;
    expect(prompt).toContain('No questionnaire data available');
  });

  it('includes recent history block only when conversation has enough messages', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: 'c2',
      messages: [
        { role: 'user', content: 'msg1', timestamp: new Date() },
        { role: 'assistant', content: 'msg2', timestamp: new Date() },
        { role: 'user', content: 'msg3', timestamp: new Date() },
      ],
    });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockResolvedValue('A');

    await service.processMessage('u1', 'new message', 'c2');

    const prompt = geminiServiceMock.generateTextResponse.mock.calls[0][0] as string;
    expect(prompt).toContain('Recent conversation:');
    expect(prompt).toContain('msg1');
  });

  it('includes reminders in the generated context prompt', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({ id: 'c3', messages: [] });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([
      { title: 'AM routine', description: 'Vitamin C', time: '08:00' },
    ]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockResolvedValue('A');

    await service.processMessage('u1', 'check routine', 'c3');

    const prompt = geminiServiceMock.generateTextResponse.mock.calls[0][0] as string;
    expect(prompt).toContain('AM routine');
    expect(prompt).toContain('Vitamin C');
  });

  it('propagates AI generation errors and does not update conversation', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({ id: 'c4', messages: [] });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockRejectedValue(new Error('AI down'));

    await expect(service.processMessage('u1', 'hello', 'c4')).rejects.toThrow('AI down');
    expect(prismaMock.conversation.update).not.toHaveBeenCalled();
  });

  it('propagates database update errors', async () => {
    prismaMock.conversation.findFirst.mockResolvedValue({ id: 'c5', messages: [] });
    prismaMock.analysis.findFirst.mockResolvedValue(null);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.skinQuestionnaire.findUnique.mockResolvedValue(null);
    geminiServiceMock.generateTextResponse.mockResolvedValue('AI answer');
    prismaMock.conversation.update.mockRejectedValue(new Error('update failed'));

    await expect(service.processMessage('u1', 'hello', 'c5')).rejects.toThrow('update failed');
  });
});
