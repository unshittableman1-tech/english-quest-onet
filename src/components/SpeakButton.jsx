import { useSpeech } from '../utils/useSpeech';
import { Volume2, Square } from 'lucide-react';

export default function SpeakButton({ text, lang = 'en-US', className = '', label = 'ฟังเสียงอ่าน' }) {
  const { speak, stop, speaking, supported } = useSpeech();

  if (!supported) return null;

  return (
    <button
      type="button"
      className={`speech-button shrink-0 flex items-center justify-center ${className}`}
      aria-label={speaking ? `หยุด ${label}` : label} aria-pressed={speaking}
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) stop();
        else speak(text, { lang });
      }}
      title={speaking ? 'หยุดเสียงอ่าน' : label}
    >
      {speaking ? <Square size={18} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
    </button>
  );
}
