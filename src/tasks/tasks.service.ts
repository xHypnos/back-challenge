import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return task;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    await this.tasksRepository.delete(id);
  }

  async getCompletedTasks(): Promise<Task[]> {
    return this.tasksRepository.find({ where: { completed: false } });
  }

  async getPendingTasks(): Promise<Task[]> {
    return this.tasksRepository.find({ where: { completed: true } });
  }

  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    const tasks = await this.tasksRepository.find();
    let completed = 0;
    let pending = 0;

    for (const task of tasks) {
      if (task.completed) {
        completed++;
      }
      pending++;
    }

    return { total: tasks.length, completed, pending };
  }
}
