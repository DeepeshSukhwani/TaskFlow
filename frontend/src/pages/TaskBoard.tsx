
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";

import {
    getProjectTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    type Task,
    type TaskStatus,
    type TaskPriority,
} from "../services/taskService";

import {
    getProjectSummary,
    type ProjectSummary,
} from "../services/projectService";

const columns: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "To Do" },
    { status: "IN_PROGRESS", title: "In Progress" },
    { status: "DONE", title: "Done" },
];

const TaskBoard = () => {
    const { projectId } = useParams<{ projectId: string }>();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Project summary
    const [summary, setSummary] = useState<ProjectSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    // Task creation
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [creating, setCreating] = useState(false);

    // Task editing
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] =
        useState<TaskPriority>("MEDIUM");
    const [editDueDate, setEditDueDate] = useState("");
    const [updating, setUpdating] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] =
        useState<TaskStatus | "ALL">("ALL");

    const [priorityFilter, setPriorityFilter] =
        useState<TaskPriority | "ALL">("ALL");

    const [sortDirection, setSortDirection] =
        useState<"ASC" | "DESC">("ASC");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Load tasks
    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                setError("");

                if (
                    !projectId ||
                    !Number.isInteger(Number(projectId)) ||
                    Number(projectId) <= 0
                ) {
                    throw new Error("Invalid project ID.");
                }

                const data = await getProjectTasks(Number(projectId));
                setTasks(data);
            } catch {
                setError("Unable to load tasks. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [projectId]);

    // Load project summary whenever tasks change
    useEffect(() => {
        const loadSummary = async () => {
            if (!projectId || Number(projectId) <= 0) {
                setSummaryLoading(false);
                return;
            }

            try {
                setSummaryLoading(true);

                const data = await getProjectSummary(Number(projectId));
                setSummary(data);
            } catch {
                setSummary(null);
            } finally {
                setSummaryLoading(false);
            }
        };

        loadSummary();
    }, [projectId, tasks]);

    // Overdue check
    const isOverdue = (task: Task): boolean => {
        if (!task.dueDate || task.status === "DONE") {
            return false;
        }

        const today = new Date().toLocaleDateString("en-CA");
        return task.dueDate < today;
    };

    // Filter and sort tasks
    const filteredTasks = tasks
        .filter((task) => {
            const matchesStatus =
                statusFilter === "ALL" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "ALL" ||
                task.priority === priorityFilter;

            return matchesStatus && matchesPriority;
        })
        .sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            const comparison = a.dueDate.localeCompare(b.dueDate);

            return sortDirection === "ASC"
                ? comparison
                : -comparison;
        });

    // Pagination calculations
    const totalPages = Math.max(
        1,
        Math.ceil(filteredTasks.length / pageSize)
    );

    const safePage = Math.min(currentPage, totalPages);

    const startIndex = (safePage - 1) * pageSize;

    const paginatedTasks = filteredTasks.slice(
        startIndex,
        startIndex + pageSize
    );

    // Reset page if filters change
    const resetToFirstPage = () => {
        setCurrentPage(1);
    };

    // Create task
    const handleCreateTask = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId) {
            setError("Project ID is missing.");
            return;
        }

        try {
            setCreating(true);
            setError("");

            const newTask = await createTask(Number(projectId), {
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate: dueDate || undefined,
            });

            setTasks((previous) => [...previous, newTask]);

            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setDueDate("");
            setCurrentPage(1);
        } catch {
            setError("Unable to create task. Please check your details.");
        } finally {
            setCreating(false);
        }
    };

    // Start editing a task
    const handleStartEdit = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description ?? "");
        setEditPriority(task.priority);
        setEditDueDate(task.dueDate ?? "");
        setError("");
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditDescription("");
        setEditPriority("MEDIUM");
        setEditDueDate("");
    };

    // Save edited task
    const handleUpdateTask = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId || editingTaskId === null) {
            setError("Unable to identify the task.");
            return;
        }

        try {
            setUpdating(true);
            setError("");

            const updatedTask = await updateTask(
                Number(projectId),
                editingTaskId,
                {
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    priority: editPriority,
                    dueDate: editDueDate || undefined,
                }
            );

            setTasks((previous) =>
                previous.map((task) =>
                    task.id === editingTaskId ? updatedTask : task
                )
            );

            handleCancelEdit();
        } catch {
            setError("Unable to update task. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    // Update status
    const handleStatusChange = async (
        taskId: number,
        newStatus: TaskStatus
    ) => {
        if (!projectId) return;

        try {
            setError("");

            const updatedTask = await updateTaskStatus(
                Number(projectId),
                taskId,
                newStatus
            );

            setTasks((previous) =>
                previous.map((task) =>
                    task.id === taskId ? updatedTask : task
                )
            );
        } catch {
            setError("Unable to update task status.");
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId: number) => {
        if (!projectId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteTask(Number(projectId), taskId);

            setTasks((previous) =>
                previous.filter((task) => task.id !== taskId)
            );

            if (editingTaskId === taskId) {
                handleCancelEdit();
            }
        } catch {
            setError("Unable to delete task. Please try again.");
        }
    };

    return (
        <div className="task-board-container">
            <header className="task-board-header">
                <h1>Task Board</h1>
                <p>Organize and track your project tasks.</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            {/* Project Summary */}
            <section className="project-summary">
                <h2>Project Overview</h2>

                {summaryLoading ? (
                    <p>Loading project summary...</p>
                ) : summary ? (
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Tasks</h3>
                            <p>{summary.totalTasks}</p>
                        </div>

                        <div className="summary-card">
                            <h3>To Do</h3>
                            <p>{summary.todoTasks}</p>
                        </div>

                        <div className="summary-card">
                            <h3>In Progress</h3>
                            <p>{summary.inProgressTasks}</p>
                        </div>

                        <div className="summary-card">
                            <h3>Completed</h3>
                            <p>{summary.completedTasks}</p>
                        </div>

                        <div className="summary-card overdue-summary-card">
                            <h3>Overdue</h3>
                            <p>{summary.overdueTasks}</p>
                        </div>
                    </div>
                ) : (
                    <p>Project summary is currently unavailable.</p>
                )}
            </section>

            {/* Create Task Form */}
            <section className="task-form-section">
                <h2>Create New Task</h2>

                <form onSubmit={handleCreateTask} className="task-form">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={200}
                        required
                    />

                    <textarea
                        placeholder="Task description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={2000}
                        rows={3}
                    />

                    <select
                        value={priority}
                        onChange={(event) =>
                            setPriority(event.target.value as TaskPriority)
                        }
                    >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                    </select>

                    <label htmlFor="task-due-date">Due date</label>

                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                    />

                    <button type="submit" disabled={creating}>
                        {creating ? "Creating..." : "Create Task"}
                    </button>
                </form>
            </section>

            {/* Filters */}
            <section className="task-filters">
                <div>
                    <label htmlFor="status-filter">Filter by status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(
                                event.target.value as TaskStatus | "ALL"
                            );
                            resetToFirstPage();
                        }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="priority-filter">Filter by priority</label>
                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(event) => {
                            setPriorityFilter(
                                event.target.value as TaskPriority | "ALL"
                            );
                            resetToFirstPage();
                        }}
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="due-date-sort">Sort by due date</label>
                    <select
                        id="due-date-sort"
                        value={sortDirection}
                        onChange={(event) => {
                            setSortDirection(
                                event.target.value as "ASC" | "DESC"
                            );
                            resetToFirstPage();
                        }}
                    >
                        <option value="ASC">Earliest First</option>
                        <option value="DESC">Latest First</option>
                    </select>
                </div>

                <button
                    type="button"
                    className="reset-filters-button"
                    onClick={() => {
                        setStatusFilter("ALL");
                        setPriorityFilter("ALL");
                        setSortDirection("ASC");
                        setCurrentPage(1);
                    }}
                >
                    Reset Filters
                </button>
            </section>

            {/* Page Size */}
            <div className="pagination-size">
                <label htmlFor="page-size">Tasks per page:</label>

                <select
                    id="page-size"
                    value={pageSize}
                    onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <>
                    <div className="kanban-board">
                        {columns.map((column) => {
                            const columnTasks = paginatedTasks.filter(
                                (task) => task.status === column.status
                            );

                            return (
                                <section
                                    className="kanban-column"
                                    key={column.status}
                                >
                                    <h2>
                                        {column.title}
                                        <span>{columnTasks.length}</span>
                                    </h2>

                                    {columnTasks.length === 0 ? (
                                        <p className="column-empty">
                                            No tasks yet
                                        </p>
                                    ) : (
                                        columnTasks.map((task) => (
                                            <article
                                                className={`task-card ${
                                                    isOverdue(task)
                                                        ? "overdue-task"
                                                        : ""
                                                }`}
                                                key={task.id}
                                            >
                                                {editingTaskId === task.id ? (
                                                    <form
                                                        className="task-form"
                                                        onSubmit={handleUpdateTask}
                                                    >
                                                        <h3>Edit Task</h3>

                                                        <input
                                                            type="text"
                                                            placeholder="Task title"
                                                            value={editTitle}
                                                            onChange={(event) =>
                                                                setEditTitle(event.target.value)
                                                            }
                                                            maxLength={200}
                                                            required
                                                        />

                                                        <textarea
                                                            placeholder="Task description"
                                                            value={editDescription}
                                                            onChange={(event) =>
                                                                setEditDescription(event.target.value)
                                                            }
                                                            maxLength={2000}
                                                            rows={3}
                                                        />

                                                        <label>Priority</label>
                                                        <select
                                                            value={editPriority}
                                                            onChange={(event) =>
                                                                setEditPriority(
                                                                    event.target.value as TaskPriority
                                                                )
                                                            }
                                                        >
                                                            <option value="LOW">Low Priority</option>
                                                            <option value="MEDIUM">Medium Priority</option>
                                                            <option value="HIGH">High Priority</option>
                                                        </select>

                                                        <label>Due date</label>
                                                        <input
                                                            type="date"
                                                            value={editDueDate}
                                                            onChange={(event) =>
                                                                setEditDueDate(event.target.value)
                                                            }
                                                        />

                                                        <div className="task-status-actions">
                                                            <button
                                                                type="submit"
                                                                disabled={updating}
                                                            >
                                                                {updating
                                                                    ? "Saving..."
                                                                    : "Save Changes"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={handleCancelEdit}
                                                                disabled={updating}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <h3>{task.title}</h3>

                                                        {isOverdue(task) && (
                                                            <span className="overdue-badge">
                                                                OVERDUE
                                                            </span>
                                                        )}

                                                        <p>
                                                            {task.description || "No description"}
                                                        </p>

                                                        <span className="task-priority">
                                                            {task.priority}
                                                        </span>

                                                        {task.dueDate && (
                                                            <p className="task-due-date">
                                                                Due: {task.dueDate}
                                                            </p>
                                                        )}

                                                        <div className="task-status-actions">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStartEdit(task)
                                                                }
                                                            >
                                                                Edit Task
                                                            </button>

                                                            {columns
                                                                .filter(
                                                                    (option) =>
                                                                        option.status !== task.status
                                                                )
                                                                .map((option) => (
                                                                    <button
                                                                        key={option.status}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                task.id,
                                                                                option.status
                                                                            )
                                                                        }
                                                                    >
                                                                        Move to {option.title}
                                                                    </button>
                                                                ))}

                                                            <button
                                                                type="button"
                                                                className="delete-task-button"
                                                                onClick={() =>
                                                                    handleDeleteTask(task.id)
                                                                }
                                                            >
                                                                Delete Task
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                        ))
                                    )}
                                </section>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <p>
                            Showing {filteredTasks.length === 0 ? 0 : startIndex + 1}
                            {" - "}
                            {Math.min(startIndex + pageSize, filteredTasks.length)}
                            {" of "}
                            {filteredTasks.length} tasks
                        </p>

                        <div>
                            <button
                                type="button"
                                disabled={safePage === 1}
                                onClick={() =>
                                    setCurrentPage((previous) =>
                                        Math.max(1, previous - 1)
                                    )
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page {safePage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={safePage === totalPages}
                                onClick={() =>
                                    setCurrentPage((previous) =>
                                        Math.min(totalPages, previous + 1)
                                    )
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TaskBoard;
