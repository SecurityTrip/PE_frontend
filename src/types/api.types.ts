// Типы для сущностей
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: number;
  projectId: number;
  dueDate: string;
}

// Типы для запросов
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: string;
  assigneeId: number;
  projectId: number;
  dueDate: string;
}

// Типы для ответов
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProjectResponse {
  project: Project;
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
  project: Project;
  assignee: User;
} 