package com.taskflow.backend.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class ProjectRequest(

    @field:NotBlank(message = "Project name is required")
    @field:Size(max = 150, message = "Project name cannot exceed 150 characters")
    val name: String,

    @field:Size(max = 1000, message = "Description cannot exceed 1000 characters")
    val description: String? = null
)

data class ProjectResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val createdAt: LocalDateTime
)