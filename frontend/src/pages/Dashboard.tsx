
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    type Project,
} from "../services/projectService";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const loadProjects = async () => {
        try {
            setError("");
            const data = await getProjects();
            setProjects(data);
        } catch {
            setError("Unable to load projects. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setError("");
            const newProject = await createProject({ name, description });
            setProjects((previous) => [...previous, newProject]);
            setName("");
            setDescription("");
        } catch {
            setError("Unable to create project.");
        }
    };

    const handleStartEdit = (project: Project) => {
        setEditingProjectId(project.id);
        setEditName(project.name);
        setEditDescription(project.description ?? "");
        setError("");
    };

    const handleCancelEdit = () => {
        setEditingProjectId(null);
        setEditName("");
        setEditDescription("");
    };

    const handleUpdateProject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingProjectId === null) return;

        try {
            setError("");

            const updatedProject = await updateProject(editingProjectId, {
                name: editName,
                description: editDescription,
            });

            setProjects((previous) =>
                previous.map((project) =>
                    project.id === editingProjectId ? updatedProject : project
                )
            );

            handleCancelEdit();
        } catch {
            setError("Unable to update project.");
        }
    };

    const handleDeleteProject = async (id: number) => {
        try {
            setError("");
            await deleteProject(id);
            setProjects((previous) =>
                previous.filter((project) => project.id !== id)
            );
        } catch {
            setError("Unable to delete project.");
        }
    };

    const handleOpenTasks = (projectId: number) => {
        navigate(`/projects/${projectId}/tasks`);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>TaskFlow</h1>
                <div>
                    <span>Welcome, {user?.name}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                <h2>My Projects</h2>
                <p>Manage your projects and track your progress.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleCreateProject}>
                    <input
                        placeholder="Project name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                    <input
                        placeholder="Project description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                    <button type="submit">Create Project</button>
                </form>

                {loading ? (
                    <p>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <h3>No projects yet</h3>
                        <p>Create your first project to get started.</p>
                    </div>
                ) : (
                    <div className="project-list">
                        {projects.map((project) => (
                            <div className="project-card" key={project.id}>
                                {editingProjectId === project.id ? (
                                    <form onSubmit={handleUpdateProject}>
                                        <h3>Edit Project</h3>

                                        <input
                                            value={editName}
                                            onChange={(event) => setEditName(event.target.value)}
                                            placeholder="Project name"
                                            required
                                        />

                                        <input
                                            value={editDescription}
                                            onChange={(event) =>
                                                setEditDescription(event.target.value)
                                            }
                                            placeholder="Project description"
                                        />

                                        <div className="project-card-actions">
                                            <button type="submit">Save Changes</button>
                                            <button type="button" onClick={handleCancelEdit}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3>{project.name}</h3>
                                        <p>{project.description}</p>

                                        <div className="project-card-actions">
                                            <button onClick={() => handleOpenTasks(project.id)}>
                                                Open Tasks
                                            </button>

                                            <button onClick={() => handleStartEdit(project)}>
                                                Edit
                                            </button>

                                            <button onClick={() => handleDeleteProject(project.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
