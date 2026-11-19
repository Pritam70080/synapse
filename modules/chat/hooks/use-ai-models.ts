import { useQuery } from "@tanstack/react-query"
import type { FreeModel, FreeModelsResponse } from "@/modules/chat/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFreeModel(value: unknown): value is FreeModel {
  if (!isRecord(value) || !isRecord(value.pricing)) return false

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.pricing.prompt === "string" &&
    typeof value.pricing.completion === "string" &&
    (value.description === undefined ||
      value.description === null ||
      typeof value.description === "string") &&
    (value.contextLength === undefined ||
      value.contextLength === null ||
      typeof value.contextLength === "number") &&
    (value.architecture === undefined ||
      value.architecture === null ||
      isRecord(value.architecture)) &&
    (value.topProvider === undefined ||
      value.topProvider === null ||
      isRecord(value.topProvider))
  )
}

function isFreeModelsResponse(value: unknown): value is FreeModelsResponse {
  if (
    !isRecord(value) ||
    typeof value.success !== "boolean" ||
    typeof value.message !== "string"
  ) {
    return false
  }

  return (
    !value.success ||
    (Array.isArray(value.models) && value.models.every(isFreeModel))
  )
}

async function fetchAiModels(): Promise<FreeModel[]> {
  const response = await fetch("/api/ai/get-model")
  const body: unknown = await response.json()

  if (!isFreeModelsResponse(body)) {
    throw new Error("The model list returned an unexpected response.")
  }

  if (!response.ok || !body.success) {
    throw new Error(body.message)
  }

  return body.models
}

export function useAiModels() {
  return useQuery({
    queryKey: ["ai-models"],
    queryFn: fetchAiModels,
    staleTime: 5 * 60 * 1000,
  })
}