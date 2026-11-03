
package com.taskflow.backend.repository

import com.taskflow.backend.entity.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : JpaRepository<Project, Long> {

    fun findAllByOwnerId(ownerId: Long): List<Project>

    fun findByIdAndOwnerId(
        projectId: Long,
        ownerId: Long
    ): Project?
}
