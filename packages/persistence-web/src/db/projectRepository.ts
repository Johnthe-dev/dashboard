import type { IProjectRepository } from '@focal/logic'
import type { ProjectRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbProjectRepository implements IProjectRepository {
  async getProjectsByModule(moduleId: string): Promise<ProjectRecord[]> {
    const db = await getDb()
    const all: ProjectRecord[] = await db.getAll(STORES.PROJECTS)
    return all.filter((p) => p.moduleId === moduleId)
  }

  async putProject(project: ProjectRecord): Promise<number> {
    const db = await getDb()
    return db.put(STORES.PROJECTS, project) as Promise<number>
  }

  async deleteProject(id: number): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.PROJECTS, id)
  }

  async deleteProjectsByModule(moduleId: string): Promise<void> {
    const db = await getDb()
    const all: ProjectRecord[] = await db.getAll(STORES.PROJECTS)
    const ids = all.filter((p) => p.moduleId === moduleId).map((p) => p.id as number)
    await Promise.all(ids.map((id) => db.delete(STORES.PROJECTS, id)))
  }

  async getAllProjects(): Promise<ProjectRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.PROJECTS)
  }

  async clearAllProjects(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.PROJECTS)
  }
}
