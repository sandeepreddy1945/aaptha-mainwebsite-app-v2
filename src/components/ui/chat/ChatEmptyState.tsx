'use client';

import { MessageCircleIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';

export const CHAT_SUGGESTIONS = [
  'What can you help me with?',
  'How can Aaptha help elderly parents?',
  'How can I contact Aaptha?',
];

interface ChatEmptyStateProps {
  onSuggestion: (suggestion: string) => void;
}

export function ChatEmptyState({ onSuggestion }: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
          <MessageCircleIcon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">How can I help?</h2>
        <p className="text-sm text-muted-foreground">Ask a question to start a conversation.</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {CHAT_SUGGESTIONS.map((suggestion) => (
          <Button
            className="h-auto min-h-9 justify-start text-left whitespace-normal"
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            type="button"
            variant="outline"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
