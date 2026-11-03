package com.taskflow.backend.specification

import com.taskflow.backend.entity.Task
import com.taskflow.backend.entity.TaskPriority
import com.taskflow.backend.entity.TaskStatus
import org.springframework.data.jpa.domain.Specification

object TaskSpecification {

    fun hasStatus(status: TaskStatus?): Specification<Task>? {
        return status?.let {
            Specification { root, _, cb ->
                cb.equal(root.get<TaskStatus>("status"), it)
            }
        }
    }

    fun hasPriority(priority: TaskPriority?): Specification<Task>? {
        return priority?.let {
            Specification { root, _, cb ->
                cb.equal(root.get<TaskPriority>("priority"), it)
            }
        }
    }

    fun belongsToProject(projectId: Long): Specification<Task> {
        return Specification { root, _, cb ->
            cb.equal(root.get<Long>("project").get<Long>("id"), projectId)
        }
    }
}