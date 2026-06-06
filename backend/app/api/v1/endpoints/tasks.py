from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.db.session import get_db
from app.models.project_task import Task
from app.models.user import User
from app.schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate

router = APIRouter()

@router.get("/project/{project_id}", response_model=List[TaskSchema])
async def read_tasks(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tasks for a specific project.
    """
    result = await db.execute(select(Task).where(Task.project_id == project_id))
    return result.scalars().all()

@router.post("/", response_model=TaskSchema)
async def create_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new task.
    """
    db_obj = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        project_id=task_in.project_id,
        assignee_id=task_in.assignee_id,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.patch("/{id}", response_model=TaskSchema)
async def update_task(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    task_in: TaskUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a task status/priority/etc.
    """
    result = await db.execute(select(Task).where(Task.id == id))
    db_obj = result.scalars().first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
        
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
