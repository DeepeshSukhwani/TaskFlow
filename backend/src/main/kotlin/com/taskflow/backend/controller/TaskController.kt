
package com.taskflow.backend.controller

import com.taskflow.backend.dto.TaskRequest
import com.taskflow.backend.dto.TaskResponse
import com.taskflow.backend.dto.TaskStatusRequest
import com.taskflow.backend.entity.Task
import com.taskflow.backend.entity.TaskPriority
import com.taskflow.backend.entity.TaskStatus
import com.taskflow.backend.service.TaskService
import com.taskflow.backend.service.UserService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
class TaskController(
    private val taskService: TaskService,
    private val userService: UserService
) {

    @PostMapping
    fun createTask(
        @PathVariable projectId: Long,
        @Valid @RequestBody request: TaskRequest,
        principal: Principal
    ): TaskResponse {
        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val task = taskService.createTask(
            title = request.title,
            description = request.description,
            priority = request.priority,
            dueDate = request.dueDate,
            projectId = projectId,
            ownerId = user.id!!
        )

        return task.toResponse()
    }

    @GetMapping
    fun getTasks(
        @PathVariable projectId: Long,
        @RequestParam(required = false) status: TaskStatus?,
        @RequestParam(required = false) priority: TaskPriority?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(defaultValue = "id") sortBy: String,
        @RequestParam(defaultValue = "DESC") direction: String,
        principal: Principal
    ): List<TaskResponse> {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val sortDirection = Sort.Direction.fromString(direction)

        val pageable = PageRequest.of(
            page,
            size,
            Sort.by(sortDirection, sortBy)
        )

        return taskService.getProjectTasks(
            projectId = projectId,
            ownerId = user.id!!,
            pageable = pageable,
            status = status,
            priority = priority
        ).content.map { it.toResponse() }
    }

    @PutMapping("/{taskId}")
    fun updateTask(
        @PathVariable projectId: Long,
        @PathVariable taskId: Long,
        @Valid @RequestBody request: TaskRequest,
        principal: Principal
    ): TaskResponse {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val updatedTask = taskService.updateTask(
            taskId = taskId,
            projectId = projectId,
            ownerId = user.id!!,
            title = request.title,
            description = request.description,
            priority = request.priority,
            dueDate = request.dueDate
        )

        return updatedTask.toResponse()
    }

    @PatchMapping("/{taskId}/status")
    fun updateTaskStatus(
        @PathVariable taskId: Long,
        @RequestBody request: TaskStatusRequest,
        principal: Principal
    ): TaskResponse {
        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        return taskService.updateTaskStatus(
            taskId,
            user.id!!,
            request.status
        ).toResponse()
    }

    @DeleteMapping("/{taskId}")
    fun deleteTask(
        @PathVariable taskId: Long,
        principal: Principal
    ) {
        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        taskService.deleteTask(taskId, user.id!!)
    }

    private fun Task.toResponse() =
        TaskResponse(
            id = id!!,
            title = title,
            description = description,
            status = status,
            priority = priority,
            dueDate = dueDate
        )
}
