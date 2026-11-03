package com.taskflow.backend.service

import com.taskflow.backend.dto.AuthResponse
import com.taskflow.backend.dto.LoginRequest
import com.taskflow.backend.dto.RegisterRequest
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userService: UserService,
    private val jwtService: JwtService,
    private val authenticationManager: AuthenticationManager
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        val user = userService.registerUser(
            request.name,
            request.email,
            request.password
        )

        val token = jwtService.generateToken(user.email)

        return AuthResponse(
            token = token,
            userId = user.id!!,
            name = user.name,
            email = user.email
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                request.email,
                request.password
            )
        )

        val user = userService.findByEmail(request.email)
            ?: throw IllegalArgumentException("Invalid email or password")

        val token = jwtService.generateToken(user.email)

        return AuthResponse(
            token = token,
            userId = user.id!!,
            name = user.name,
            email = user.email
        )
    }
}