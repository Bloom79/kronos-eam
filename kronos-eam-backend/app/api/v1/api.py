"""
API v1 router aggregator
Combines all endpoint routers
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    auth_simple,
    users,
    plants,
    workflows,
    workflow,
    documents,
    ai_assistant,
    rpa_proxy,
    voice,
    dashboard,
    calendar,
    integrations,
    notifications,
    chat,
    smart_assistant,
    tasks,
    audit
)

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

# Simple auth for testing
api_router.include_router(
    auth_simple.router,
    prefix="/auth",
    tags=["authentication"]
)

# User management
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

# Power Plants management
api_router.include_router(
    plants.router,
    prefix="/plants",
    tags=["plants"]
)

# Workflow management
api_router.include_router(
    workflows.router,
    prefix="/workflows",
    tags=["workflows"]
)

# Document management
api_router.include_router(
    documents.router,
    prefix="/documents",
    tags=["documents"]
)

# AI Assistant
api_router.include_router(
    ai_assistant.router,
    prefix="/ai",
    tags=["ai-assistant"]
)

# RPA Proxy
api_router.include_router(
    rpa_proxy.router,
    prefix="/rpa",
    tags=["rpa-automation"]
)

# Voice features
api_router.include_router(
    voice.router,
    prefix="/voice",
    tags=["voice"]
)

# Dashboard and analytics
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

# Calendar and deadlines
api_router.include_router(
    calendar.router,
    prefix="/calendar",
    tags=["calendar"]
)

# External integrations
api_router.include_router(
    integrations.router,
    prefix="/integrations",
    tags=["integrations"]
)

# Notifications
api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"]
)

# Chat with AI agents
api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"]
)

# Smart Assistant for portal automation
api_router.include_router(
    smart_assistant.router,
    prefix="/smart-assistant",
    tags=["smart-assistant"]
)

# Renewable Energy Workflow Management
api_router.include_router(
    workflow.router,
    prefix="/workflow",
    tags=["workflow"]
)

# Enhanced Task Management
api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["tasks"]
)

# Audit Trail
api_router.include_router(
    audit.router,
    prefix="/audit",
    tags=["audit"]
)