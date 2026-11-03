
package com.taskflow.backend.service

import com.taskflow.backend.dto.ProjectSummaryResponse
import com.taskflow.backend.entity.Project
import com.taskflow.backend.entity.TaskStatus
import com.taskflow.backend.entity.User
import com.taskflow.backend.repository.ProjectRepository
import com.taskflow.backend.repository.TaskRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val taskRepository: TaskRepository
) {

    @Transactional
    fun createProject(
        name: String,
        description: String?,
        owner: User
    ): Project {
        val project = Project(
            name = name,
            description = description,
            owner = owner
        )

        return projectRepository.save(project)
    }

    fun getUserProjects(ownerId: Long): List<Project> {
        return projectRepository.findAllByOwnerId(ownerId)
    }

    fun getProjectById(
        projectId: Long,
        ownerId: Long
    ): Project {
        return projectRepository.findByIdAndOwnerId(
            projectId,
            ownerId
        ) ?: throw NoSuchElementException("Project not found")
    }

    // Update an existing project
    @Transactional
    fun updateProject(
        projectId: Long,
        ownerId: Long,
        name: String,
        description: String?
    ): Project {
        val project = getProjectById(projectId, ownerId)

        project.name = name
        project.description = description

        return projectRepository.save(project)
    }

    @Transactional
    fun deleteProject(
        projectId: Long,
        ownerId: Long
    ) {
        val project = getProjectById(projectId, ownerId)
        projectRepository.delete(project)
    }

    fun getProjectSummary(
        projectId: Long,
        ownerId: Long
    ): ProjectSummaryResponse {

        val project = getProjectById(projectId, ownerId)

        val totalTasks = taskRepository.countByProjectId(projectId)

        val todoTasks = taskRepository.countByProjectIdAndStatus(
            projectId,
            TaskStatus.TODO
        )

        val inProgressTasks = taskRepository.countByProjectIdAndStatus(
            projectId,
            TaskStatus.IN_PROGRESS
        )

        val completedTasks = taskRepository.countByProjectIdAndStatus(
            projectId,
            TaskStatus.DONE
        )

        val overdueTasks =
            taskRepository.countByProjectIdAndDueDateBeforeAndStatusNot(
                projectId,
                LocalDate.now(),
                TaskStatus.DONE
            )

        return ProjectSummaryResponse(
            projectId = project.id!!,
            projectName = project.name,
            totalTasks = totalTasks,
            todoTasks = todoTasks,
            inProgressTasks = inProgressTasks,
            completedTasks = completedTasks,
            overdueTasks = overdueTasks
        )
    }
}
