
import api from "./api";

export interface Project {
    id: number;
    name: string;
    description: string;
}

export interface ProjectRequest {
    name: string;
    description: string;
}

export interface ProjectSummary {
    projectId: number;
    projectName: string;
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
}

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get<Project[]>("/projects");
    return response.data;
};

export const createProject = async (
    data: ProjectRequest
): Promise<Project> => {
    const response = await api.post<Project>("/projects", data);
    return response.data;
};

export const updateProject = async (
    id: number,
    data: ProjectRequest
): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
};

export const getProjectSummary = async (
    projectId: number
): Promise<ProjectSummary> => {
    const response = await api.get<ProjectSummary>(
        `/projects/${projectId}/summary`
    );
    return response.data;
};
