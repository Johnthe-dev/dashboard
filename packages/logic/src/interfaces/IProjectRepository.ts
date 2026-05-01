import type { ProjectRecord } from '../types/project'

export interface IProjectRepository {
  getProjectsByModule(moduleId: string): Promise<ProjectRecord[]>
  putProject(project: ProjectRecord): Promise<number>
  deleteProject(id: number): Promise<void>
  deleteProjectsByModule(moduleId: string): Promise<void>
  getAllProjects(): Promise<ProjectRecord[]>
  clearAllProjects(): Promise<void>
}
