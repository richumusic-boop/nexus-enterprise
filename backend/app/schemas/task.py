from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "TODO"
    priority: Optional[str] = "MEDIUM"
    assignee_id: Optional[UUID] = None

class TaskCreate(TaskBase):
    project_id: UUID

class TaskUpdate(TaskBase):
    title: Optional[str] = None

class TaskInDBBase(TaskBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Task(TaskInDBBase):
    pass
