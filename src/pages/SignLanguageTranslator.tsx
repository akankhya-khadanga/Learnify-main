/**
 * Sign Language Translator
 * 
 * Convert text to Indian Sign Language using real CWASA avatars
 * Supports 1,722+ ISL signs from real datasets
 */

import { ISLAvatarPlayer } from '@/components/signLanguage/ISLAvatarPlayer';

export default function SignLanguageTranslator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-8">
      <ISLAvatarPlayer className="px-4" />
    </div>
  );
}
