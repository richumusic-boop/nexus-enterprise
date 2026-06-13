import asyncio
import logging
import sys
import os
from typing import Optional
from uuid import UUID

# Ensure the app directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastmcp import FastMCP
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.project_task import Project, Task
from app.models.user import User, UserRole

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-mcp")

# Initialize FastMCP
# We use stdio by default for local tool use, but we'll export it for SSE mounting in main.py
mcp = FastMCP("Nexus Enterprise", stateless_http=True)

async def get_default_user(session):
    """Get the first active user to act as the MCP context."""
    result = await session.execute(select(User).where(User.is_active == True).limit(1))
    user = result.scalars().first()
    if not user:
        # Create a default admin if none exists (for development)
        logger.info("No active user found, creating a default 'nexus_mcp' user.")
        user = User(
            email="mcp@nexus.enterprise",
            hashed_password="not_needed_for_mcp",
            full_name="Nexus MCP Bot",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    return user

@mcp.tool()
async def list_projects() -> str:
    """List all projects in the Nexus system."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Project).where(Project.is_deleted == False))
        projects = result.scalars().all()
        if not projects:
            return "No projects found."
        return "\n".join([f"- {p.name} (ID: {p.id}): {p.description or 'No description'}" for p in projects])

@mcp.tool()
async def create_project(name: str, description: str = "") -> str:
    """Create a new project."""
    async with AsyncSessionLocal() as session:
        user = await get_default_user(session)
        project = Project(name=name, description=description, owner_id=user.id)
        session.add(project)
        await session.commit()
        await session.refresh(project)
        return f"Project created: {project.name} (ID: {project.id})"

@mcp.tool()
async def get_project_details(project_id: str) -> str:
    """Get details and tasks for a specific project."""
    try:
        p_uuid = UUID(project_id)
    except ValueError:
        return f"Invalid project ID format: {project_id}"

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Project).where(Project.id == p_uuid))
        project = result.scalars().first()
        if not project:
            return "Project not found."
        
        task_result = await session.execute(select(Task).where(Task.project_id == p_uuid, Task.is_deleted == False))
        tasks = task_result.scalars().all()
        
        details = f"Project: {project.name}\nDescription: {project.description or 'N/A'}\nTasks:\n"
        if not tasks:
            details += "No tasks found."
        else:
            for t in tasks:
                details += f"- [{t.status}] {t.title} (ID: {t.id}) - Priority: {t.priority}\n"
        return details

@mcp.tool()
async def create_task(project_id: str, title: str, description: str = "", priority: str = "MEDIUM") -> str:
    """Create a task within a project."""
    try:
        p_uuid = UUID(project_id)
    except ValueError:
        return f"Invalid project ID format: {project_id}"

    async with AsyncSessionLocal() as session:
        task = Task(
            title=title,
            description=description,
            priority=priority,
            project_id=p_uuid,
            status="TODO"
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return f"Task created: {task.title} (ID: {task.id}) in project {project_id}"

@mcp.tool()
async def update_task_status(task_id: str, status: str) -> str:
    """Update the status of a task (e.g., TODO, IN_PROGRESS, DONE)."""
    try:
        t_uuid = UUID(task_id)
    except ValueError:
        return f"Invalid task ID format: {task_id}"

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Task).where(Task.id == t_uuid))
        task = result.scalars().first()
        if not task:
            return "Task not found."
        
        old_status = task.status
        task.status = status
        await session.commit()
        return f"Task {task_id} updated from {old_status} to {status}"

if __name__ == "__main__":
    mcp.run()
