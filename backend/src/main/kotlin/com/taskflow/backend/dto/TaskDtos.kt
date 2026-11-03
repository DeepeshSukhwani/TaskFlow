package com.taskflow.backend.dto

import com.taskflow.backend.entity.TaskPriority
import com.taskflow.backend.entity.TaskStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class TaskRequest(

    @field:NotBlank(message = "Task title is required")
    @field:Size(max = 200, message = "Title cannot exceed 200 characters")
    val title: String,

    @field:Size(max = 2000, message = "Description cannot exceed 2000 characters")
    val description: String? = null,

    val priority: TaskPriority = TaskPriority.MEDIUM,

    val dueDate: LocalDate? = null
)

data class TaskStatusRequest(
    val status: TaskStatus
)

data class TaskResponse(
    val id: Long,
    val title: String,
    val description: String?,
    val status: TaskStatus,
    val priority: TaskPriority,
    val dueDate: LocalDate?
)