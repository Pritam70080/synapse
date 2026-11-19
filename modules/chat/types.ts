export type FreeModel = {
  id: string
  name: string
  description?: string | null
  contextLength?: number | null
  architecture?: Record<string, unknown> | null
  pricing: {
    prompt: string
    completion: string
    [key: string]: unknown
  }
  topProvider?: Record<string, unknown> | null
}

export type FreeModelsResponse =
  | {
      success: true
      models: FreeModel[]
      message: string
    }
  | {
      success: false
      message: string
    }
