'use client';

import { MicIcon, SquareIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '~/components/ui/button';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechWindow = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};

interface VoiceInputButtonProps {
  disabled?: boolean;
  onTranscriptionChange: (transcription: string) => void;
}

export function VoiceInputButton({ disabled, onTranscriptionChange }: VoiceInputButtonProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onTranscriptionChangeRef = useRef(onTranscriptionChange);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  onTranscriptionChangeRef.current = onTranscriptionChange;

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index]?.isFinal) {
          transcript += event.results[index]?.[0]?.transcript ?? '';
        }
      }

      if (transcript) {
        onTranscriptionChangeRef.current(transcript);
      }
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition || disabled) {
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <Button
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      className="size-9 shrink-0 rounded-full p-0 [&_svg]:size-4"
      disabled={disabled || !isSupported}
      onClick={toggleListening}
      title={isSupported ? 'Use voice input' : 'Voice input is not supported in this browser'}
      type="button"
      variant={isListening ? 'destructive' : 'ghost'}
    >
      {isListening ? <SquareIcon aria-hidden="true" /> : <MicIcon aria-hidden="true" />}
    </Button>
  );
}
