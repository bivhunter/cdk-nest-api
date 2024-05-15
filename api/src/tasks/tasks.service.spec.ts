import { Test } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { User } from '../auth/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { expect, jest } from '@jest/globals';

const mockTasksRepository = () => ({
    findAllTasks: jest.fn<() => Promise<Task>>(),
    findTaskById: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    update: jest.fn(),
});

const mockUser: User = {
    username: 'name',
    id: 'id',
    tasks: [],
    password: 'pas',
};

const mockTask: Task = {
    title: 'Test',
    description: 'Test',
    id: 'id',
    status: TaskStatus.OPEN,
    user: mockUser,
};

const mockDeleteResult = jest.fn();
mockDeleteResult.mockImplementation((a: number) => {
    return {
        affected: a,
    };
});

describe('TaskService', () => {
    let tasksService: TasksService;
    let tasksRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                TasksService,
                { provide: TasksRepository, useFactory: mockTasksRepository },
            ],
        }).compile();

        tasksService = module.get<TasksService>(TasksService);
        tasksRepository = module.get(TasksRepository);
    });

    describe('getAllTasks', () => {
        it('should calls TaskRepository.getAllTasks and returns the result', async () => {
            tasksRepository.findAllTasks.mockResolvedValue([mockTask]);
            const result = await tasksService.getAllTasks(null, mockUser);
            expect(tasksRepository.findAllTasks).toHaveBeenCalledWith(
                null,
                mockUser,
            );
            expect(result).toEqual([mockTask]);
        });
    });

    describe('createTask', () => {
        it('should calls TaskRepository.createTask and returns the result', async () => {
            tasksRepository.createTask.mockResolvedValue([mockTask]);
            const result = await tasksService.createTask(null, mockUser);
            expect(tasksRepository.createTask).toHaveBeenCalledWith(
                null,
                mockUser,
            );
            expect(result).toEqual([mockTask]);
        });
    });

    describe('updateTaskStatusById', () => {
        it('should calls TaskRepository.update, TasksService.getTaskById and returns the result', async () => {
            tasksRepository.update.mockResolvedValue(mockTask);
            jest.spyOn(tasksService, 'getTaskById').mockResolvedValue(mockTask);
            const result = await tasksService.updateTaskStatusById(
                '1',
                { status: TaskStatus.IN_PROGRESS },
                mockUser,
            );
            expect(tasksRepository.update).toHaveBeenCalledWith('1', {
                status: TaskStatus.IN_PROGRESS,
            });
            expect(result).toEqual({
                ...mockTask,
                status: TaskStatus.IN_PROGRESS,
            });
        });
    });

    describe('getTaskById', () => {
        it('should calls TaskRepository.findTaskById and returns the result', async () => {
            tasksRepository.findTaskById.mockResolvedValue(mockTask);
            const result = await tasksService.getTaskById('1', mockUser);
            expect(tasksRepository.findTaskById).toHaveBeenCalledWith(
                '1',
                mockUser,
            );
            expect(result).toEqual(mockTask);
        });

        it('should calls TaskRepository.findTaskById and handle exceptions', async () => {
            tasksRepository.findTaskById.mockResolvedValue(null);
            expect(tasksService.getTaskById('1', mockUser)).rejects.toThrow(
                new NotFoundException('Task 1 not found'),
            );
            expect(tasksRepository.findTaskById).toHaveBeenCalledWith(
                '1',
                mockUser,
            );
        });
    });

    describe('deleteTaskById', () => {
        it('should calls TaskRepository.deleteTask and returns the result', async () => {
            tasksRepository.deleteTask.mockResolvedValue(mockDeleteResult(1));
            const result = await tasksService.deleteTaskById('1', mockUser);
            expect(tasksRepository.deleteTask).toHaveBeenCalledWith(
                '1',
                mockUser,
            );
            expect({
                affected: 1,
            }).toEqual(result);
        });

        it('should calls TaskRepository.findTaskById and handle exceptions', async () => {
            tasksRepository.deleteTask.mockResolvedValue(mockDeleteResult(0));
            expect(tasksService.deleteTaskById('1', mockUser)).rejects.toThrow(
                new NotFoundException('Task 1 not found'),
            );
            expect(tasksRepository.deleteTask).toHaveBeenCalledWith(
                '1',
                mockUser,
            );
        });
    });
});
