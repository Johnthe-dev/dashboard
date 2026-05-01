export interface QuickLink {
  id: number
  label: string
  url: string
}

export interface QuickLinkRecord {
  moduleId: string
  links: QuickLink[]
}
