// src/types/handler.ts
import type { TSchema } from '@sinclair/typebox'

export interface RouteContext {
  query: TSchema
  params: TSchema
  body: TSchema
  headers: Record<string, string>
  set: {
    headers: Record<string, string>
    status?: number
  }
}