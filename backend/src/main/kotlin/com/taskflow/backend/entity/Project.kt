
package com.taskflow.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "projects")
class Project(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 150)
    var name: String,

    @Column(length = 1000)
    var description: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: User,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
