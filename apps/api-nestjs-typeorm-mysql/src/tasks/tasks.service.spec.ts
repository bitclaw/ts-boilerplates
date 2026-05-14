import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskStatus } from './task.entity';
import { TasksService } from './tasks.service';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepo }
      ]
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('findAll returns tasks for user', async () => {
    const tasks = [{ id: '1', title: 'Test', userId: 'u1' }];
    mockRepo.find.mockResolvedValue(tasks);
    const result = await service.findAll('u1');
    expect(result).toEqual(tasks);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      order: { createdAt: 'DESC' }
    });
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('create saves and returns task', async () => {
    const dto = { title: 'New', status: TaskStatus.TODO };
    const task = { id: '1', ...dto, userId: 'u1' };
    mockRepo.create.mockReturnValue(task);
    mockRepo.save.mockResolvedValue(task);
    const result = await service.create(dto, 'u1');
    expect(result).toEqual(task);
  });
});
