import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksRepository extends Repository<Task> {
    private logger = new Logger('TasksRepository', { timestamp: true });

    constructor(private dataSource: DataSource) {
        super(Task, dataSource.createEntityManager());
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const task: Task = this.create({
            ...createTaskDto,
            status: TaskStatus.OPEN,
            user,
        });

        await this.save(task);
        return task;
    }

    async findTaskById(id: string, user: User): Promise<Task> {
        return this.findOneBy({ id, user });
    }

    async deleteTask(id: string, user: User): Promise<DeleteResult> {
        return this.delete({ id, user });
    }

    async findAllTasks(
        filterDto: GetTasksFilterDto,
        user: User,
    ): Promise<Array<Task>> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('task');

        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
                { search: `%${search.toLowerCase()}%` },
            );
        }

        query.andWhere('task.user = :user', { user: user.id });

        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this,
                this.logger.error(
                    `Failed to get task for user ${user.username}. Filters ${JSON.stringify(filterDto)}`,
                    error.stack,
                );
            throw new InternalServerErrorException();
        }
    }

    async updateTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
    ): Promise<UpdateResult> {
        return this.update(id, updateTaskDto);
    }
}
