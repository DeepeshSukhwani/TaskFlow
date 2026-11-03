package com.taskflow.backend.repository

import com.taskflow.backend.entity.Task
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.time.LocalDate
import com.taskflow.backend.entity.TaskStatus

interface TaskRepository :
    JpaRepository<Task, Long>,
    JpaSpecificationExecutor<Task> {

    fun findAllByProjectId(
        projectId: Long,
        pageable: org.springframework.data.domain.Pageable
    ): org.springframework.data.domain.Page<Task>

    fun countByProjectId(projectId: Long): Long

    fun countByProjectIdAndStatus(
        projectId: Long,
        status: TaskStatus
    ): Long

    fun countByProjectIdAndDueDateBeforeAndStatusNot(
        projectId: Long,
        date: LocalDate,
        status: TaskStatus
    ): Long
}