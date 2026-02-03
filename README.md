# Task Manager API

A simple REST API for managing tasks.

## Requirements

- Node.js >= 20
- pnpm

## Setup

```bash
pnpm install
```

### Create a `.env` file

Create a `.env` file in the root directory of the project using the `.env.sample` file as a template.

```bash
cp .env.sample .env
```

## Running the application

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks | *
| GET | /tasks/stats | Get task statistics (total, completed, pending) | *
| GET | /tasks/:id | Get a task by ID | *
| POST | /tasks | Create a new task | *
| PATCH | /tasks/:id | Update a task | * 
| DELETE | /tasks/:id | Delete a task |

### Query Parameters

- `GET /tasks?status=completed` - Get only completed tasks
- `GET /tasks?status=pending` - Get only pending tasks

### Task Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated ID |
| title | string | Task title (required) |
| description | string | Task description (optional) |
| completed | boolean | Completion status (default: false) |
| createdAt | date | Creation timestamp |
| updatedAt | date | Last update timestamp |

## Database

SQLite database. The file `database.sqlite` is created automatically on first run.
