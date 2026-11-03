# TaskFlow – Team Task Management Application

TaskFlow is a full-stack task management application that helps users organize projects, manage tasks, track progress, and monitor overdue work.

## Tech Stack

- **Backend:** Kotlin, Spring Boot 3.5, Spring Security, JWT, Spring Data JPA
- **Frontend:** React, TypeScript, Vite, Axios
- **Database:** PostgreSQL
- **Tools:** Gradle, Docker, Git

## Features

- User registration and JWT authentication.
- Create, update, and delete projects.
- Create, edit, and delete tasks.
- Manage task status and priority.
- Filter, sort, and paginate tasks.
- Highlight overdue tasks.
- Project progress summary.
- Secure user-specific project access.

## Project Structure

```text
TaskFlow/
├── backend/       # Spring Boot application
├── frontend/      # React application
├── .gitignore
└── README.md
```

## Setup and Installation

### Prerequisites

- JDK 21
- Node.js and npm
- Docker Desktop
- Git

### 1. Clone the Repository

```powershell
git clone https://github.com/DeepeshSukhwani/TaskFlow.git
cd TaskFlow
```

### 2. Start PostgreSQL

Start Docker Desktop and wait for the Docker engine to become ready.

Run this command from PowerShell:

```powershell
docker run -d --name taskflow-postgres `
  -e POSTGRES_DB=taskflowdb `
  -e POSTGRES_USER=taskflow `
  -e POSTGRES_PASSWORD=YOUR_DB_PASSWORD `
  -p 5433:5432 `
  -v taskflow-postgres-data:/var/lib/postgresql/data `
  postgres:17
```

Replace `YOUR_DB_PASSWORD` with your own database password.

Verify the container:

```powershell
docker ps
```

### 3. Configure Backend

Open the `backend` folder in IntelliJ IDEA.

Go to **Run → Edit Configurations → Gradle bootRun → Environment Variables**.

Configure:

| Variable | Value |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/taskflowdb` |
| `DB_USERNAME` | `taskflow` |
| `DB_PASSWORD` | Your PostgreSQL password |
| `JWT_SECRET` | Your Base64-encoded secret |
| `JAVA_TOOL_OPTIONS` | `-Duser.timezone=UTC` |

Generate a JWT secret using PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copy the generated value into `JWT_SECRET`.

Keep your credentials private. Never commit actual passwords or JWT secrets.

### 4. Run Backend

From IntelliJ, run the Gradle `bootRun` task.

Alternatively, from the project root:

```powershell
cd backend
.\gradlew.bat bootRun
```

Backend URL: `http://localhost:8080`

Health check: `http://localhost:8080/api/health`

### 5. Run Frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

### 6. Start Using TaskFlow

1. Open `http://localhost:5173`.
2. Register a new account.
3. Log in.
4. Create your first project.
5. Add tasks and manage their progress.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}/summary` | Project summary |
| POST | `/api/projects/{id}/tasks` | Create task |
| GET | `/api/projects/{id}/tasks` | List tasks |
| PUT | `/api/projects/{id}/tasks/{taskId}` | Update task |
| PATCH | `/api/projects/{id}/tasks/{taskId}/status` | Update task status |
| DELETE | `/api/projects/{id}/tasks/{taskId}` | Delete task |

Protected endpoints require a JWT Bearer token.

## Architecture

```text
React Frontend
      |
      v
REST Controllers
      |
      v
Service Layer
      |
      v
Repository Layer
      |
      v
PostgreSQL
```

**Design patterns:** Repository Pattern, Specification Pattern, and Service Layer.

## Repository

[GitHub – TaskFlow](https://github.com/DeepeshSukhwani/TaskFlow)