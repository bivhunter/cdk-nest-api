import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { Task } from './task.entity';
import { DeleteResult } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    constructor(private readonly tasksRepository: TasksRepository) {}

    async getAllTasks(
        filterDto: GetTasksFilterDto,
        user: User,
    ): Promise<Array<Task>> {
        return this.tasksRepository.findAllTasks(filterDto, user);
    }

    async getTaskById(id: string, user: User): Promise<Task> {
        const foundedTask = await this.tasksRepository.findTaskById(id, user);
        if (!foundedTask) {
            throw new NotFoundException(`Task ${id} not found`);
        }

        return foundedTask;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.tasksRepository.createTask(createTaskDto, user);
    }

    async updateTaskStatusById(
        id: string,
        updateTaskDto: UpdateTaskDto,
        user: User,
    ): Promise<Task> {
        const task: Task = await this.getTaskById(id, user);
        this.tasksRepository.update(id, updateTaskDto);
        return {
            ...task,
            ...updateTaskDto,
        };
    }

    async deleteTaskById(id: string, user: User): Promise<DeleteResult> {
        const result = await this.tasksRepository.deleteTask(id, user);
        if (!result?.affected) {
            throw new NotFoundException(`Task ${id} not found`);
        }
        return result;
    }
}
