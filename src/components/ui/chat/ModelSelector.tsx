'use client';

import { ChevronDownIcon } from 'lucide-react';

export const AVAILABLE_MODELS = [
  { id: 'qwen3.5:4b', name: 'Qwen 3.5 4B' },
  { id: 'qwen3:0.6b', name: 'Qwen 3 0.6B' },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]['id'];

interface ModelSelectorProps {
  disabled?: boolean;
  onValueChange: (value: ModelId) => void;
  value: ModelId;
}

export function ModelSelector({ disabled, onValueChange, value }: ModelSelectorProps) {
  return (
    <label className="relative inline-flex shrink-0">
      <span className="sr-only">Select Ollama model</span>
      <select
        aria-label="Select Ollama model"
        className="h-8 max-w-40 shrink-0 appearance-none rounded-lg border border-input bg-background py-1 pr-7 pl-2 text-xs font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onChange={(event) => onValueChange(event.currentTarget.value as ModelId)}
        value={value}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2 size-4 shrink-0 -translate-y-1/2"
      />
    </label>
  );
}
