
import api from "./api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
}

export interface TaskRequest {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
}

export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "ASC" | "DESC";
}

export const getProjectTasks = async (
    projectId: number,
    filters: TaskFilters = {}
): Promise<Task[]> => {
    const response = await api.get<Task[]>(
        `/projects/${projectId}/tasks`,
        { params: filters }
    );
    return response.data;
};

export const createTask = async (
    projectId: number,
    data: TaskRequest
): Promise<Task> => {
    const response = await api.post<Task>(
        `/projects/${projectId}/tasks`,
        data
    );
    return response.data;
};

export const updateTask = async (
    projectId: number,
    taskId: number,
    data: TaskRequest
): Promise<Task> => {
    const response = await api.put<Task>(
        `/projects/${projectId}/tasks/${taskId}`,
        data
    );
    return response.data;
};

export const updateTaskStatus = async (
    projectId: number,
    taskId: number,
    status: TaskStatus
): Promise<Task> => {
    const response = await api.patch<Task>(
        `/projects/${projectId}/tasks/${taskId}/status`,
        { status }
    );
    return response.data;
};

export const deleteTask = async (
    projectId: number,
    taskId: number
): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
};
