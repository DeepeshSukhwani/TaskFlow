package com.taskflow.backend.dto

data class ProjectSummaryResponse(
    val projectId: Long,
    val projectName: String,
    val totalTasks: Long,
    val todoTasks: Long,
    val inProgressTasks: Long,
    val completedTasks: Long,
    val overdueTasks: Long
)