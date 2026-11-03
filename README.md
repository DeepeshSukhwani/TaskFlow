# TaskFlow – Team Task Management Application

TaskFlow is a full-stack task management application that helps users organize projects, manage tasks, track progress, and identify overdue work.

## Tech Stack

### Backend
- Kotlin
- Spring Boot 3.5
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- PostgreSQL
- Gradle
- JUnit 5 and MockK (test dependencies)

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React

## Features

- User registration and login with JWT authentication.
- Secure, user-specific project management.
- Create, view, update, and delete projects.
- Create, view, edit, and delete tasks.
- Task statuses: TODO, IN_PROGRESS, DONE.
- Task priorities: LOW, MEDIUM, HIGH.
- Filter tasks by status and priority.
- Sort and paginate task lists.
- Update task status.
- Highlight overdue tasks.
- Project summary with total, pending, in-progress, completed, and overdue task counts.
- Protected frontend routes.

## Project Structure

```text
TaskFlow/
├── backend/
│   └── src/
│       └── main/
│           ├── kotlin/
│           └── resources/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- JDK 21
- Gradle 9.8.2
- Node.js and npm
- Docker Desktop
- Git

## Database Configuration

TaskFlow uses PostgreSQL.

Create a PostgreSQL database and configure these environment variables:

| Variable | Description |
|---|---|
| DB_URL | PostgreSQL JDBC connection URL |
| DB_USERNAME | Database username |
| DB_PASSWORD | Database password |
| JWT_SECRET | Base64-encoded JWT signing secret |

Example local database URL:

```text
jdbc:postgresql://localhost:5433/taskflowdb
```

Never commit actual database credentials or JWT secrets.

## Running the Backend

1. Start PostgreSQL.
2. Configure the required environment variables.
3. Open the backend folder in IntelliJ IDEA.
4. Run the Gradle `bootRun` task.

Backend URL:

```text
http://localhost:8080
```

Health endpoint:

```text
GET /api/health
```

## Running the Frontend

Open a terminal in the frontend directory:

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Main API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### Projects
- GET `/api/projects`
- POST `/api/projects`
- GET `/api/projects/{projectId}`
- PUT `/api/projects/{projectId}`
- DELETE `/api/projects/{projectId}`
- GET `/api/projects/{projectId}/summary`

### Tasks
- POST `/api/projects/{projectId}/tasks`
- GET `/api/projects/{projectId}/tasks`
- PUT `/api/projects/{projectId}/tasks/{taskId}`
- PATCH `/api/projects/{projectId}/tasks/{taskId}/status`
- DELETE `/api/projects/{projectId}/tasks/{taskId}`

Task listing supports status and priority filters, sorting, and pagination.

## Security

- JWT-based authentication.
- Protected API endpoints.
- User-specific project ownership checks.
- Password encoding.
- Request validation.

## Design Patterns

- **Repository Pattern:** Separates database access from business logic.
- **Specification Pattern:** Supports dynamic task filtering based on multiple criteria.
- **Service Layer:** Keeps business logic separate from controllers.

## Sample Usage

1. Register a new account.
2. Log in to TaskFlow.
3. Create a project.
4. Add tasks with priorities and due dates.
5. Update task statuses as work progresses.
6. Use filters and project summaries to monitor progress.

## License

This project is developed as a software engineering assignment.