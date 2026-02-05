/**
 * CWASA Sign Language Utilities
 * Helper functions for working with CWASA avatars
 */

// Common ISL (Indian Sign Language) signs available in CWASA
export const COMMON_ISL_SIGNS = [
  // Greetings
  'hello', 'goodbye', 'thankyou', 'sorry', 'please', 'welcome',
  
  // Basic words
  'yes', 'no', 'ok', 'good', 'bad', 'help', 'stop', 'go', 'come',
  
  // Questions
  'what', 'when', 'where', 'who', 'why', 'how',
  
  // Family
  'mother', 'father', 'brother', 'sister', 'family', 'friend',
  
  // Numbers (fingerspelling)
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  
  // Colors
  'red', 'blue', 'green', 'yellow', 'white', 'black',
  
  // Common actions
  'eat', 'drink', 'sleep', 'read', 'write', 'learn', 'teach', 'play',
  'walk', 'run', 'sit', 'stand',
  
  // Time
  'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  
  // Places
  'home', 'school', 'hospital', 'office', 'market', 'temple', 'church',
  
  // Feelings
  'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty', 'sick', 'pain',
  
  // Education
  'student', 'teacher', 'book', 'pen', 'paper', 'class', 'exam', 'study',
  
  // Common phrases (fingerspelled)
  'name', 'age', 'time', 'date', 'place', 'address', 'phone',
];

// Word translations from Indian languages to English
export const WORD_TRANSLATIONS: Record<string, string> = {
  // Tamil
  'வணக்கம்': 'hello',
  'நன்றி': 'thankyou',
  'வாருங்கள்': 'welcome',
  'போ': 'go',
  'ஆம்': 'yes',
  'இல்லை': 'no',
  'நல்ல': 'good',
  'கெட்ட': 'bad',
  'பெரிய': 'big',
  'சிறிய': 'small',
  
  // Hindi
  'नमस्ते': 'hello',
  'धन्यवाद': 'thankyou',
  'आओ': 'come',
  'जाओ': 'go',
  'हाँ': 'yes',
  'नहीं': 'no',
  'अच्छा': 'good',
  'बुरा': 'bad',
  'बड़ा': 'big',
  'छोटा': 'small',
};

/**
 * Check if CWASA library is loaded
 */
export function isCWASALoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.CWASASigningAvatar !== 'undefined';
}

/**
 * Wait for CWASA library to load
 */
export function waitForCWASA(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isCWASALoaded()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isCWASALoaded()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Translate word from Indian language to English for CWASA
 */
export function translateWord(word: string): string {
  const normalized = word.trim().toLowerCase();
  return WORD_TRANSLATIONS[word] || normalized;
}

/**
 * Check if a word has a sign available in CWASA
 */
export function hasSign(word: string): boolean {
  const translatedWord = translateWord(word);
  return COMMON_ISL_SIGNS.includes(translatedWord);
}

/**
 * Split sentence into signable words
 */
export function splitIntoSignableWords(sentence: string): string[] {
  // Remove punctuation and split by spaces
  const words = sentence
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  // Translate each word
  return words.map(word => translateWord(word));
}

/**
 * Get sign language lesson difficulty based on word complexity
 */
export function getWordDifficulty(word: string): 'beginner' | 'intermediate' | 'advanced' {
  const translatedWord = translateWord(word);
  const length = translatedWord.length;
  
  // Beginner: common short words
  if (COMMON_ISL_SIGNS.slice(0, 30).includes(translatedWord)) {
    return 'beginner';
  }
  
  // Advanced: long words requiring fingerspelling
  if (length > 8) {
    return 'advanced';
  }
  
  // Intermediate: everything else
  return 'intermediate';
}

export default {
  COMMON_ISL_SIGNS,
  WORD_TRANSLATIONS,
  isCWASALoaded,
  waitForCWASA,
  translateWord,
  hasSign,
  splitIntoSignableWords,
  getWordDifficulty,
};
