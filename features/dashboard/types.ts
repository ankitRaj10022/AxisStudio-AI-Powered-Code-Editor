import type { Template, UserRole } from "@/lib/database/constants";

export interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: UserRole
    createdAt: Date
    updatedAt: Date
  }
  
export interface Project {
    id: string
    title: string
    description: string | null
    template: Template
    createdAt: Date
    updatedAt: Date
    userId: string
    user: User
    Starmark: { isMarked: boolean }[]
  }
  
