
package com.taskflow.backend.service

import com.taskflow.backend.entity.Task
import com.taskflow.backend.entity.TaskPriority
import com.taskflow.backend.entity.TaskStatus
import com.taskflow.backend.repository.TaskRepository
import com.taskflow.backend.specification.TaskSpecification
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val projectService: ProjectService
) {

    @Transactional
    fun createTask(
        title: String,
        description: String?,
        priority: TaskPriority,
        dueDate: LocalDate?,
        projectId: Long,
        ownerId: Long
    ): Task {
        val project = projectService.getProjectById(projectId, ownerId)

        val task = Task(
            title = title,
            description = description,
            priority = priority,
            dueDate = dueDate,
            project = project
        )

        return taskRepository.save(task)
    }

    fun getProjectTasks(
        projectId: Long,
        ownerId: Long,
        pageable: Pageable,
        status: TaskStatus? = null,
        priority: TaskPriority? = null
    ): Page<Task> {

        // Verify project ownership
        projectService.getProjectById(projectId, ownerId)

        // Mandatory project filter
        var specification =
            TaskSpecification.belongsToProject(projectId)

        // Apply optional status filter
        TaskSpecification.hasStatus(status)?.let {
            specification = specification.and(it)
        }

        // Apply optional priority filter
        TaskSpecification.hasPriority(priority)?.let {
            specification = specification.and(it)
        }

        return taskRepository.findAll(specification, pageable)
    }

    @Transactional
    fun updateTask(
        taskId: Long,
        projectId: Long,
        ownerId: Long,
        title: String,
        description: String?,
        priority: TaskPriority,
        dueDate: LocalDate?
    ): Task {

        // Find the task
        val task = taskRepository.findById(taskId)
            .orElseThrow { NoSuchElementException("Task not found") }

        // Verify that the task belongs to the requested project
        if (task.project.id != projectId) {
            throw NoSuchElementException("Task not found")
        }

        // Verify that the logged-in user owns the project
        projectService.getProjectById(projectId, ownerId)

        // Update task details
        task.title = title
        task.description = description
        task.priority = priority
        task.dueDate = dueDate

        // Preserve existing task status
        return taskRepository.save(task)
    }

    @Transactional
    fun updateTaskStatus(
        taskId: Long,
        ownerId: Long,
        status: TaskStatus
    ): Task {
        val task = taskRepository.findById(taskId)
            .orElseThrow { NoSuchElementException("Task not found") }

        projectService.getProjectById(task.project.id!!, ownerId)

        task.status = status

        return taskRepository.save(task)
    }

    @Transactional
    fun deleteTask(
        taskId: Long,
        ownerId: Long
    ) {
        val task = taskRepository.findById(taskId)
            .orElseThrow { NoSuchElementException("Task not found") }

        projectService.getProjectById(task.project.id!!, ownerId)

        taskRepository.delete(task)
    }
}
