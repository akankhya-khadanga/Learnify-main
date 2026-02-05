/**
 * Expanded ISL Dataset
 * 
 * Provides comprehensive mappings for Indian Sign Language including:
 * - Common phrases and their sign sequences
 * - Regional language translations (Hindi, Tamil)
 * - Context-aware variations
 * - Synonym mappings for better coverage
 */

export interface PhraseMapping {
    phrase: string;
    signs: string[];
    category: 'greeting' | 'question' | 'daily' | 'emergency' | 'education' | 'emotion';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LanguageMapping {
    original: string;
    english: string;
    signs?: string[];
}

// Common phrase mappings to sign sequences
export const PHRASE_MAPPINGS: PhraseMapping[] = [
    // Greetings
    { phrase: 'how are you', signs: ['you', 'how'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'howareyou', signs: ['you', 'how'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'good morning', signs: ['good', 'morning'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'good night', signs: ['good', 'night'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'good afternoon', signs: ['good', 'afternoon'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'nice to meet you', signs: ['nice', 'meet', 'you'], category: 'greeting', difficulty: 'beginner' },
    { phrase: 'see you later', signs: ['see', 'you', 'later'], category: 'greeting', difficulty: 'beginner' },

    // Questions
    { phrase: 'what is your name', signs: ['you', 'name', 'what'], category: 'question', difficulty: 'beginner' },
    { phrase: 'namewhat', signs: ['name', 'what'], category: 'question', difficulty: 'beginner' },
    { phrase: 'where do you live', signs: ['you', 'where', 'live'], category: 'question', difficulty: 'beginner' },
    { phrase: 'how old are you', signs: ['you', 'age', 'how'], category: 'question', difficulty: 'beginner' },
    { phrase: 'what time is it', signs: ['time', 'what'], category: 'question', difficulty: 'beginner' },
    { phrase: 'can you help me', signs: ['you', 'me', 'help-me'], category: 'question', difficulty: 'beginner' },

    // Daily conversation
    { phrase: 'i am hungry', signs: ['i', 'hungry'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'i am thirsty', signs: ['i', 'thirsty'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'i need water', signs: ['i', 'water', 'need'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'i need help', signs: ['i', 'help-me'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'i dont understand', signs: ['i', 'understand', 'not'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'please repeat', signs: ['please', 'repeat'], category: 'daily', difficulty: 'beginner' },
    { phrase: 'thank you very much', signs: ['thankyou', 'very'], category: 'daily', difficulty: 'beginner' },

    // Emergency
    { phrase: 'i need doctor', signs: ['i', 'doctor', 'need'], category: 'emergency', difficulty: 'beginner' },
    { phrase: 'call ambulance', signs: ['ambulance', 'call'], category: 'emergency', difficulty: 'beginner' },
    { phrase: 'where is hospital', signs: ['hospital', 'where'], category: 'emergency', difficulty: 'beginner' },

    // Education
    { phrase: 'i am learning', signs: ['i', 'learn'], category: 'education', difficulty: 'beginner' },
    { phrase: 'i am a student', signs: ['i', 'student'], category: 'education', difficulty: 'beginner' },
    { phrase: 'i go to school', signs: ['i', 'school', 'go'], category: 'education', difficulty: 'beginner' },
    { phrase: 'teach me please', signs: ['me', 'teachme', 'please'], category: 'education', difficulty: 'beginner' },

    // Emotions
    { phrase: 'i am happy', signs: ['i', 'happy'], category: 'emotion', difficulty: 'beginner' },
    { phrase: 'i am sad', signs: ['i', 'sad'], category: 'emotion', difficulty: 'beginner' },
    { phrase: 'i am angry', signs: ['i', 'angry'], category: 'emotion', difficulty: 'beginner' },
    { phrase: 'i am afraid', signs: ['i', 'afraid'], category: 'emotion', difficulty: 'beginner' },
    { phrase: 'i love you', signs: ['i', 'you', 'love'], category: 'emotion', difficulty: 'beginner' },
];

// Tamil to English mappings
export const TAMIL_MAPPINGS: LanguageMapping[] = [
    // Greetings
    { original: 'வணக்கம்', english: 'hello', signs: ['hello'] },
    { original: 'நன்றி', english: 'thankyou', signs: ['thankyou'] },
    { original: 'வரவேற்பு', english: 'welcome', signs: ['welcome'] },

    // Common words
    { original: 'ஆம்', english: 'yes', signs: ['yes'] },
    { original: 'இல்லை', english: 'no', signs: ['no'] },
    { original: 'தயவு செய்து', english: 'please', signs: ['please'] },
    { original: 'மன்னிக்கவும்', english: 'sorry', signs: ['sorry'] },

    // Actions
    { original: 'வாருங்கள்', english: 'come', signs: ['come'] },
    { original: 'போ', english: 'go', signs: ['go'] },
    { original: 'சாப்பிடு', english: 'eat', signs: ['eat'] },
    { original: 'குடி', english: 'drink', signs: ['drinking'] },
    { original: 'படி', english: 'read', signs: ['read'] },
    { original: 'எழுது', english: 'write', signs: ['write'] },

    // Descriptors
    { original: 'நல்ல', english: 'good', signs: ['good'] },
    { original: 'கெட்ட', english: 'bad', signs: ['bad'] },
    { original: 'பெரிய', english: 'big', signs: ['big'] },
    { original: 'சிறிய', english: 'small', signs: ['small'] },
    { original: 'அழகான', english: 'beautiful', signs: ['beautiful'] },

    // People
    { original: 'தந்தை', english: 'father', signs: ['father'] },
    { original: 'தாய்', english: 'mother', signs: ['mother'] },
    { original: 'மகன்', english: 'boy', signs: ['boy'] },
    { original: 'மகள்', english: 'girl', signs: ['girl'] },
    { original: 'ஆசிரியர்', english: 'teacher', signs: ['teacher'] },

    // Time
    { original: 'காலை', english: 'morning', signs: ['morning'] },
    { original: 'மதியம்', english: 'afternoon', signs: ['afternoon'] },
    { original: 'மாலை', english: 'evening', signs: ['evening'] },
    { original: 'இரவு', english: 'night', signs: ['night'] },
    { original: 'இன்று', english: 'today', signs: ['today'] },
    { original: 'நாளை', english: 'tomorrow', signs: ['tomorrow'] },
    { original: 'நேற்று', english: 'yesterday', signs: ['yesterday'] },
];

// Hindi to English mappings
export const HINDI_MAPPINGS: LanguageMapping[] = [
    // Greetings
    { original: 'नमस्ते', english: 'hello', signs: ['hello'] },
    { original: 'धन्यवाद', english: 'thankyou', signs: ['thankyou'] },
    { original: 'स्वागत', english: 'welcome', signs: ['welcome'] },

    // Common words
    { original: 'हाँ', english: 'yes', signs: ['yes'] },
    { original: 'नहीं', english: 'no', signs: ['no'] },
    { original: 'कृपया', english: 'please', signs: ['please'] },
    { original: 'माफ़ करना', english: 'sorry', signs: ['sorry'] },

    // Actions
    { original: 'आओ', english: 'come', signs: ['come'] },
    { original: 'जाओ', english: 'go', signs: ['go'] },
    { original: 'खाओ', english: 'eat', signs: ['eat'] },
    { original: 'पीओ', english: 'drink', signs: ['drinking'] },
    { original: 'पढ़ो', english: 'read', signs: ['read'] },
    { original: 'लिखो', english: 'write', signs: ['write'] },

    // Descriptors
    { original: 'अच्छा', english: 'good', signs: ['good'] },
    { original: 'बुरा', english: 'bad', signs: ['bad'] },
    { original: 'बड़ा', english: 'big', signs: ['big'] },
    { original: 'छोटा', english: 'small', signs: ['small'] },
    { original: 'सुंदर', english: 'beautiful', signs: ['beautiful'] },

    // People
    { original: 'पिता', english: 'father', signs: ['father'] },
    { original: 'माता', english: 'mother', signs: ['mother'] },
    { original: 'लड़का', english: 'boy', signs: ['boy'] },
    { original: 'लड़की', english: 'girl', signs: ['girl'] },
    { original: 'शिक्षक', english: 'teacher', signs: ['teacher'] },

    // Time
    { original: 'सुबह', english: 'morning', signs: ['morning'] },
    { original: 'दोपहर', english: 'afternoon', signs: ['afternoon'] },
    { original: 'शाम', english: 'evening', signs: ['evening'] },
    { original: 'रात', english: 'night', signs: ['night'] },
    { original: 'आज', english: 'today', signs: ['today'] },
    { original: 'कल', english: 'tomorrow', signs: ['tomorrow'] },
    { original: 'बीता हुआ कल', english: 'yesterday', signs: ['yesterday'] },
];

// Synonym mappings for better coverage
export const SYNONYM_MAPPINGS: Record<string, string> = {
    // Greetings variants
    'hi': 'hello',
    'hey': 'hello',
    'greetings': 'hello',
    'howdy': 'hello',

    // Thanks variants
    'thanks': 'thankyou',
    'thx': 'thankyou',
    'grateful': 'thankyou',

    // Action variants
    'walking': 'walk',
    'running': 'run',
    'eating': 'eat',
    'drinking': 'drink',
    'reading': 'read',
    'writing': 'write',
    'sleeping': 'sleep',
    'sitting': 'sit',
    'standing': 'stand',

    // Question variants
    'whats': 'what',
    'hows': 'how',
    'wheres': 'where',
    'whos': 'who',
    'whys': 'why',

    // Emotion variants
    'glad': 'happy',
    'joyful': 'happy',
    'unhappy': 'sad',
    'upset': 'sad',
    'mad': 'angry',
    'scared': 'afraid',
    'frightened': 'afraid',

    // Time variants
    'a.m.': 'morning',
    'p.m.': 'afternoon',
    'evening': 'afternoon',

    // Common contractions
    'im': 'i',
    'youre': 'you',
    'hes': 'he',
    'shes': 'she',
    'theyre': 'they',
    'cant': 'cannot',
    'wont': 'will not',
    'dont': 'do not',
    'doesnt': 'does not',
};

// Common signs for preloading (top 50 most used)
export const COMMON_SIGNS = [
    'hello', 'thankyou', 'yes', 'no', 'please', 'sorry', 'good', 'bad',
    'i', 'you', 'he', 'she', 'we', 'they', 'me', 'my', 'your',
    'what', 'how', 'where', 'when', 'why', 'who', 'which',
    'eat', 'drink', 'go', 'come', 'help', 'need', 'want', 'like',
    'happy', 'sad', 'angry', 'love', 'name', 'time', 'today',
    'morning', 'afternoon', 'evening', 'night',
    'father', 'mother', 'boy', 'girl', 'teacher', 'student'
];

/**
 * Get phrase mapping for a given phrase
 */
export function getPhraseMapping(phrase: string): string[] | null {
    const normalized = phrase.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');

    // Check for exact phrase match
    const exactMatch = PHRASE_MAPPINGS.find(p =>
        p.phrase === normalized || p.phrase === normalized.replace(/\s/g, '')
    );

    if (exactMatch) {
        return exactMatch.signs;
    }

    // Check for partial phrase matches
    for (const mapping of PHRASE_MAPPINGS) {
        if (normalized.includes(mapping.phrase)) {
            return mapping.signs;
        }
    }

    return null;
}

/**
 * Translate regional language to English with signs
 */
export function translateRegionalLanguage(text: string): { english: string; signs?: string[] } | null {
    // Check Tamil
    const tamilMatch = TAMIL_MAPPINGS.find(m => m.original === text);
    if (tamilMatch) {
        return { english: tamilMatch.english, signs: tamilMatch.signs };
    }

    // Check Hindi
    const hindiMatch = HINDI_MAPPINGS.find(m => m.original === text);
    if (hindiMatch) {
        return { english: hindiMatch.english, signs: hindiMatch.signs };
    }

    return null;
}

/**
 * Get synonym mapping for a word
 */
export function getSynonym(word: string): string | null {
    const normalized = word.toLowerCase().trim();
    return SYNONYM_MAPPINGS[normalized] || null;
}

/**
 * Categorize phrase by type
 */
export function categorizePhrase(phrase: string): PhraseMapping['category'] | null {
    const normalized = phrase.toLowerCase().trim();
    const match = PHRASE_MAPPINGS.find(p => p.phrase === normalized);
    return match ? match.category : null;
}
