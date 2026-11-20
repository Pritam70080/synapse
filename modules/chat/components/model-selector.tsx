"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Check,
  ChevronDown,
  Info,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAiModels } from "@/modules/chat/hooks/use-ai-models"
import type { FreeModel } from "@/modules/chat/types"

type ModelSelectorProps = {
  value: string
  onValueChange: (modelId: string) => void
}

export function isFreeModel(model: FreeModel) {
  const promptPrice = Number(model.pricing.prompt)
  const completionPrice = Number(model.pricing.completion)

  return (
    model.pricing.prompt.trim() !== "" &&
    model.pricing.completion.trim() !== "" &&
    Number.isFinite(promptPrice) &&
    Number.isFinite(completionPrice) &&
    promptPrice === 0 &&
    completionPrice === 0
  )
}

export function formatContextLength(contextLength: number | null | undefined) {
  if (
    contextLength === null ||
    contextLength === undefined ||
    !Number.isFinite(contextLength) ||
    contextLength <= 0
  ) {
    return "Unknown"
  }

  if (contextLength >= 1_000_000) {
    return `${formatCompact(contextLength / 1_000_000)}M`
  }

  if (contextLength >= 1_000) {
    return `${formatCompact(contextLength / 1_000)}K`
  }

  return `${new Intl.NumberFormat("en-US").format(contextLength)} tokens`
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)
}

function getModelSearchText(model: FreeModel) {
  return [
    model.name,
    model.description ?? "",
    model.id,
    JSON.stringify(model.architecture ?? {}),
  ]
    .join(" ")
    .toLocaleLowerCase()
}

function getStringField(
  record: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = record?.[key]
  return typeof value === "string" && value.trim() ? value : "Not provided"
}

function getStringListField(
  record: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = record?.[key]
  if (!Array.isArray(value)) return "Not provided"

  const strings = value.filter((item): item is string => typeof item === "string")
  return strings.length ? strings.join(", ") : "Not provided"
}

function getNumberField(
  record: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = record?.[key]
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function ModelSelector({
  value,
  onValueChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [detailsModel, setDetailsModel] = useState<FreeModel | null>(null)
  const { data: models = [], error, isPending, refetch } = useAiModels()

  const freeModels = useMemo(() => models.filter(isFreeModel), [models])
  const selectedModel =
    freeModels.find((model) => model.id === value) ?? freeModels[freeModels.length - 1] ?? null
  const filteredModels = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return query
      ? freeModels.filter((model) => getModelSearchText(model).includes(query))
      : freeModels
  }, [freeModels, search])

  useEffect(() => {
    if (!value && selectedModel) {
      onValueChange(selectedModel.id)
    }
  }, [onValueChange, selectedModel, value])

  const modelError =
    error instanceof Error ? error.message : "Unable to load free models."

  return (
    <div className="min-w-0 flex-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={isPending || freeModels.length === 0}
              aria-label="Choose a free AI model"
              className="w-full min-w-0 justify-start gap-2 rounded-full bg-muted/60"
            >
              {isPending ? (
                <LoaderCircle
                  className="size-4 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Sparkles
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-left">
                {selectedModel?.name ??
                  (isPending ? "Loading free models..." : "Choose a free model")}
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0"
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search models by name, description, ID, or architecture"
                placeholder="Search free models..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 rounded-xl pl-9 pr-10"
              />
              {search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear model search"
                  onClick={() => setSearch("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <X aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              {filteredModels.length} free{" "}
              {filteredModels.length === 1 ? "model" : "models"}
            </p>
          </div>

          <div
            aria-label="Free models"
            className="max-h-72 overflow-y-auto p-2"
            role="list"
          >
            {filteredModels.length ? (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  role="listitem"
                  className="flex items-center gap-1 rounded-xl p-1 transition-colors hover:bg-accent"
                >
                  <button
                    type="button"
                    aria-pressed={selectedModel?.id === model.id}
                    onClick={() => {
                      onValueChange(model.id)
                      setIsOpen(false)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {model.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {formatContextLength(model.contextLength)} context
                      </span>
                    </span>
                    <Badge variant="secondary">Free</Badge>
                    {selectedModel?.id === model.id ? (
                      <Check
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary"
                      />
                    ) : null}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Details for ${model.name}`}
                    onClick={() => {
                      setIsOpen(false)
                      setDetailsModel(model)
                    }}
                    className="shrink-0"
                  >
                    <Info aria-hidden="true" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No free models match your search.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 text-xs text-destructive" role="alert">
            {modelError}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            className="shrink-0"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : !isPending && freeModels.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          No free models are available right now.
        </p>
      ) : null}

      <Dialog
        open={detailsModel !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsModel(null)
        }}
      >
        {detailsModel ? (
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles aria-hidden="true" className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="pr-8">
                    {detailsModel.name}
                  </DialogTitle>
                  <DialogDescription className="mt-2 break-words">
                    {detailsModel.description || "No description is available."}
                  </DialogDescription>
                </div>
                <Badge variant="secondary">Free</Badge>
              </div>
            </DialogHeader>

            <dl className="grid gap-3 sm:grid-cols-2">
              <ModelDetail label="Model ID">
                <code className="break-all font-mono text-xs">
                  {detailsModel.id}
                </code>
              </ModelDetail>
              <ModelDetail label="Context length">
                {formatContextLength(detailsModel.contextLength)}
              </ModelDetail>
              <ModelDetail label="Architecture">
                {getStringField(detailsModel.architecture, "modality")}
              </ModelDetail>
              <ModelDetail label="Input modalities">
                {getStringListField(
                  detailsModel.architecture,
                  "input_modalities",
                )}
              </ModelDetail>
              <ModelDetail label="Output modalities">
                {getStringListField(
                  detailsModel.architecture,
                  "output_modalities",
                )}
              </ModelDetail>
              <ModelDetail label="Tokenizer">
                {getStringField(detailsModel.architecture, "tokenizer")}
              </ModelDetail>
              <ModelDetail label="Provider context">
                {formatContextLength(
                  getNumberField(detailsModel.topProvider, "context_length"),
                )}
              </ModelDetail>
              <ModelDetail label="Maximum completion">
                {formatContextLength(
                  getNumberField(
                    detailsModel.topProvider,
                    "max_completion_tokens",
                  ),
                )}
              </ModelDetail>
            </dl>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}

function ModelDetail({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm">{children}</dd>
    </div>
  )
}
