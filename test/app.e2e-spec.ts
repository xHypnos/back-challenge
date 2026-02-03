import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { mockTasks } from './mockTasks';
import { Server } from 'http';

function expectTaskShape(body: unknown) {
  expect(body).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    completed: false,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });
}

async function createTasks(server: App) {
  const responses = await Promise.all(
    mockTasks.map((task) => request(server).post('/tasks').send(task)),
  );
  return responses.map((res) => res.body);
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /tasks', async () => {
    const server = app.getHttpServer();

    for (const task of mockTasks) {
      await request(server)
        .post('/tasks')
        .send(task)
        .expect(201)
        .expect((res) => expectTaskShape(res.body));
    }
  });

  it('GET /tasks', () => {
    const server = app.getHttpServer();

    return request(server)
      .get('/tasks')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((task: unknown) => expectTaskShape(task));
      });
  });

  it('GET /tasks/stats', () => {
    const server = app.getHttpServer();

    return request(server)
      .get('/tasks/stats')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('total');
        expect(typeof (res.body.total as unknown)).toBe('number');
        expect(res.body).toHaveProperty('completed');
        expect(typeof (res.body.completed as unknown)).toBe('number');
        expect(res.body).toHaveProperty('pending');
        expect(typeof (res.body.pending as unknown)).toBe('number');
      });
  });

  it('GET /tasks/:id', async () => {
    const server = app.getHttpServer();
    const tasks = await createTasks(server);

    for (const task of tasks) {
      await request(server)
        .get(`/tasks/${task.id}`)
        .expect(200)
        .expect((res) => expectTaskShape(res.body));
    }
  });

  it('PATCH /tasks/:id', async () => {
    const server = app.getHttpServer();
    const tasks = await createTasks(server);

    for (const task of tasks) {
      await request(server)
        .patch(`/tasks/${task.id}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
          completed: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Task');
          expect(res.body.description).toBe('Updated Description');
          expect(res.body.completed).toEqual(true);
        });
    }
  });

  it('DELETE /tasks/:id', async () => {
    const server = app.getHttpServer();
    const tasks = await createTasks(server);

    for (const task of tasks) {
      await request(server)
        .delete(`/tasks/${task.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({});
        });

      await request(server)
        .get(`/tasks/${task.id}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(`Task #${task.id} not found`);
        });
    }
  });
});
