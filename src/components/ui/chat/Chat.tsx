'use client';

import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageCircleIcon, SendIcon, SquareIcon, WrenchIcon, XIcon } from 'lucide-react';
import { useState, type ComponentProps, type KeyboardEvent } from 'react';
import { useChat } from '@ai-sdk/react';

import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';

import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ModelSelector, type ModelId } from './ModelSelector';
import { VoiceInputButton } from './VoiceInputButton';

type ChatSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

const transport = new DefaultChatTransport({ api: '/api/chat' });

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelId>('qwen3.5:4b');
  const [toolsEnabled, setToolsEnabled] = useState(false);
  const { messages, sendMessage, status, error, clearError, stop } = useChat({ transport });
  const isBusy = status === 'submitted' || status === 'streaming';
  const lastMessage = messages.at(-1);

  const sendText = (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText || isBusy) {
      return;
    }

    setInput('');
    void sendMessage({ text: trimmedText }, { body: { enableTools: toolsEnabled, model: selectedModel } });
  };

  const appendVoiceText = (transcription: string) => {
    const trimmedTranscription = transcription.trim();

    if (!trimmedTranscription) {
      return;
    }

    setInput((current) => {
      const separator = current && !/\s$/.test(current) ? ' ' : '';
      return `${current}${separator}${trimmedTranscription}`;
    });
  };

  const handleSubmit = (event: ChatSubmitEvent) => {
    event.preventDefault();
    sendText(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="not-prose">
      {isOpen && (
        <section
          aria-labelledby="aaptha-chat-title"
          aria-modal="false"
          className="fixed right-4 bottom-24 z-40 flex h-[min(700px,calc(100svh-8rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:right-6 sm:w-[420px]"
          id="aaptha-chat-panel"
          role="dialog"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircleIcon aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold" id="aaptha-chat-title">
                  Aaptha Assistant
                </h2>
                <p className="truncate text-xs text-muted-foreground">Ask about Aaptha elder care services.</p>
              </div>
            </div>
            <Button
              aria-label="Close Aaptha assistant"
              className="size-8 shrink-0 p-0 [&_svg]:size-4"
              onClick={() => setIsOpen(false)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </header>

          <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-3">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 py-4">
              {messages.length === 0 ? (
                <ChatEmptyState onSuggestion={sendText} />
              ) : (
                messages.map((message: UIMessage) => (
                  <ChatMessage
                    isStreaming={isBusy && message.id === lastMessage?.id && message.role === 'assistant'}
                    key={message.id}
                    message={message}
                    showTools={toolsEnabled}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl space-y-3 px-3 pt-2 pb-3">
            {error && (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <span>{error.message || 'Something went wrong.'}</span>
                <Button onClick={clearError} size="sm" type="button" variant="ghost">
                  Dismiss
                </Button>
              </div>
            )}

            <form className="rounded-xl border border-input bg-background p-2 shadow-sm" onSubmit={handleSubmit}>
              <Textarea
                aria-label="Message Aaptha assistant"
                className="max-h-32 min-h-16 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                disabled={isBusy}
                onChange={(event) => setInput(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Aaptha…"
                value={input}
              />
              <div className="flex min-w-0 items-center justify-between gap-2 pt-2">
                <ModelSelector disabled={isBusy} onValueChange={setSelectedModel} value={selectedModel} />
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    aria-label={toolsEnabled ? 'Disable assistant tools' : 'Enable assistant tools'}
                    aria-pressed={toolsEnabled}
                    className="size-9 shrink-0 p-0 [&_svg]:size-4"
                    disabled={isBusy}
                    onClick={() => setToolsEnabled((enabled) => !enabled)}
                    size="icon-lg"
                    title={toolsEnabled ? 'Disable assistant tools' : 'Enable assistant tools'}
                    type="button"
                    variant={toolsEnabled ? 'secondary' : 'ghost'}
                  >
                    <WrenchIcon aria-hidden="true" />
                  </Button>
                  <VoiceInputButton disabled={isBusy} onTranscriptionChange={appendVoiceText} />
                  <Button
                    aria-label={isBusy ? 'Stop response' : 'Send message'}
                    className="size-9 shrink-0 p-0 [&_svg]:size-4"
                    disabled={!isBusy && !input.trim()}
                    onClick={isBusy ? () => void stop() : undefined}
                    size="icon-lg"
                    type={isBusy ? 'button' : 'submit'}
                  >
                    {isBusy ? <SquareIcon aria-hidden="true" /> : <SendIcon aria-hidden="true" />}
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-center text-[0.6875rem] text-muted-foreground">
              Powered locally by Ollama · Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </section>
      )}

      <Button
        aria-controls="aaptha-chat-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close Aaptha assistant' : 'Open Aaptha assistant'}
        className="fixed right-4 bottom-4 z-50 !size-14 shrink-0 rounded-full p-0 shadow-lg sm:right-6 sm:bottom-6 [&_svg]:size-6"
        onClick={() => setIsOpen((open) => !open)}
        size="icon-lg"
        type="button"
      >
        {isOpen ? <XIcon aria-hidden="true" /> : <MessageCircleIcon aria-hidden="true" />}
      </Button>
    </div>
  );
}
