import { connection, NextResponse } from "next/server"

type OpenRouterPricing = {
  prompt: string
  completion: string
  [key: string]: unknown
}

type OpenRouterModel = {
  id: string
  name: string
  description?: string | null
  context_length?: number | null
  architecture?: Record<string, unknown> | null
  pricing: OpenRouterPricing
  top_provider?: Record<string, unknown> | null
}

type OpenRouterModelsResponse = {
  data: OpenRouterModel[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isOpenRouterModel(value: unknown): value is OpenRouterModel {
  if (!isRecord(value) || !isRecord(value.pricing)) return false

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.pricing.prompt === "string" &&
    typeof value.pricing.completion === "string" &&
    (value.description === undefined ||
      value.description === null ||
      typeof value.description === "string") &&
    (value.context_length === undefined ||
      value.context_length === null ||
      typeof value.context_length === "number") &&
    (value.architecture === undefined ||
      value.architecture === null ||
      isRecord(value.architecture)) &&
    (value.top_provider === undefined ||
      value.top_provider === null ||
      isRecord(value.top_provider))
  )
}

function isOpenRouterModelsResponse(
  value: unknown,
): value is OpenRouterModelsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isOpenRouterModel)
  )
}

function isFreePrice(price: string) {
  const parsedPrice = Number(price)
  return price.trim() !== "" && Number.isFinite(parsedPrice) && parsedPrice === 0
}

export async function GET() {
  await connection()

  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Accept: "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    })

    if (!response.ok) {
      console.error(`OpenRouter models request failed with status ${response.status}`)
      return NextResponse.json(
        { success: false, message: "OpenRouter API request failed" },
        { status: 502 },
      )
    }

    const body: unknown = await response.json()
    if (!isOpenRouterModelsResponse(body)) {
      console.error("OpenRouter returned an invalid models response")
      return NextResponse.json(
        { success: false, message: "OpenRouter returned invalid model data" },
        { status: 502 },
      )
    }

    const models = body.data
      .filter(
        (model) =>
          isFreePrice(model.pricing.prompt) &&
          isFreePrice(model.pricing.completion),
      )
      .map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        contextLength: model.context_length,
        architecture: model.architecture,
        pricing: model.pricing,
        topProvider: model.top_provider,
      }))

    return NextResponse.json({
      success: true,
      models,
      message: "Successfully fetched free models",
    })
  } catch (error: unknown) {
    console.error("Error fetching free models from OpenRouter:", error)
    return NextResponse.json(
      { success: false, message: "Unable to fetch models from OpenRouter" },
      { status: 502 },
    )
  }
}
