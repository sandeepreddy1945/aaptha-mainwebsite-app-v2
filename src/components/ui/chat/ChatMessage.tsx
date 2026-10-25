'use client';

import { isToolUIPart, type UIMessage } from 'ai';
import { BotIcon, UserRoundIcon } from 'lucide-react';

import { Bubble, BubbleContent } from '~/components/ui/bubble';
import { Message, MessageAvatar, MessageContent } from '~/components/ui/message';

import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from './tool';

interface ChatMessageProps {
  isStreaming: boolean;
  message: UIMessage;
  showTools?: boolean;
}

const getText = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

export function ChatMessage({ isStreaming, message, showTools = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const text = getText(message);
  const toolParts = showTools ? message.parts.filter(isToolUIPart) : [];

  return (
    <Message align={isUser ? 'end' : 'start'} className="items-start">
      <MessageAvatar
        aria-label={isUser ? 'User message' : 'Assistant message'}
        className={
          isUser
            ? 'size-8 shrink-0 bg-secondary text-secondary-foreground'
            : 'size-8 shrink-0 bg-primary text-primary-foreground'
        }
      >
        {isUser ? (
          <UserRoundIcon aria-hidden="true" className="size-4" />
        ) : (
          <BotIcon aria-hidden="true" className="size-4" />
        )}
      </MessageAvatar>
      <MessageContent className="max-w-[calc(100%-2.5rem)]">
        {(text || isStreaming) && (
          <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'outline'}>
            <BubbleContent className="whitespace-pre-wrap break-words">
              {text || (isStreaming ? 'Thinking…' : '')}
            </BubbleContent>
          </Bubble>
        )}
        {toolParts.map((part, index) => (
          <Tool key={`${message.id}-tool-${index}`}>
            {part.type === 'dynamic-tool' ? (
              <ToolHeader state={part.state} toolName={part.toolName} type={part.type} />
            ) : (
              <ToolHeader state={part.state} type={part.type} />
            )}
            <ToolContent>
              <ToolInput input={part.input} />
              <ToolOutput errorText={part.errorText} output={part.output} />
            </ToolContent>
          </Tool>
        ))}
      </MessageContent>
    </Message>
  );
}
