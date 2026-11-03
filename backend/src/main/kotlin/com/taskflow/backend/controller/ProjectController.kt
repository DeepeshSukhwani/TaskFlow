
package com.taskflow.backend.controller

import com.taskflow.backend.dto.ProjectRequest
import com.taskflow.backend.dto.ProjectResponse
import com.taskflow.backend.dto.ProjectSummaryResponse
import com.taskflow.backend.service.ProjectService
import com.taskflow.backend.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/projects")
class ProjectController(
    private val projectService: ProjectService,
    private val userService: UserService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createProject(
        @Valid @RequestBody request: ProjectRequest,
        principal: Principal
    ): ProjectResponse {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val project = projectService.createProject(
            request.name,
            request.description,
            user
        )

        return ProjectResponse(
            id = project.id!!,
            name = project.name,
            description = project.description,
            createdAt = project.createdAt
        )
    }

    @GetMapping
    fun getProjects(principal: Principal): List<ProjectResponse> {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        return projectService.getUserProjects(user.id!!)
            .map { project ->
                ProjectResponse(
                    id = project.id!!,
                    name = project.name,
                    description = project.description,
                    createdAt = project.createdAt
                )
            }
    }

    @GetMapping("/{id}")
    fun getProject(
        @PathVariable id: Long,
        principal: Principal
    ): ProjectResponse {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val project = projectService.getProjectById(
            id,
            user.id!!
        )

        return ProjectResponse(
            id = project.id!!,
            name = project.name,
            description = project.description,
            createdAt = project.createdAt
        )
    }

    // Update an existing project
    @PutMapping("/{id}")
    fun updateProject(
        @PathVariable id: Long,
        @Valid @RequestBody request: ProjectRequest,
        principal: Principal
    ): ProjectResponse {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        val project = projectService.updateProject(
            projectId = id,
            ownerId = user.id!!,
            name = request.name,
            description = request.description
        )

        return ProjectResponse(
            id = project.id!!,
            name = project.name,
            description = project.description,
            createdAt = project.createdAt
        )
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteProject(
        @PathVariable id: Long,
        principal: Principal
    ) {
        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        projectService.deleteProject(id, user.id!!)
    }

    @GetMapping("/{id}/summary")
    fun getProjectSummary(
        @PathVariable id: Long,
        principal: Principal
    ): ProjectSummaryResponse {

        val user = userService.findByEmail(principal.name)
            ?: throw NoSuchElementException("User not found")

        return projectService.getProjectSummary(
            projectId = id,
            ownerId = user.id!!
        )
    }
}
