/**
 * Gemini AI Lesson Generation Service
 * 
 * Handles:
 * - Topic understanding and breakdown
 * - Adaptive difficulty adjustment
 * - Sign-language-optimized teaching scripts
 * - Visual learning material generation
 * - Spaced repetition scheduling
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  SignLesson,
  LessonScript,
  LessonSection,
  SignLanguageType,
  DifficultyLevel,
  LearningSpeed,
} from '../types/signLanguage';
import { getCCMAService } from './ccmaSignLanguage';

interface LessonGenerationRequest {
  topic: string;
  difficulty: DifficultyLevel;
  signLanguage: SignLanguageType;
  learningSpeed: LearningSpeed;
  userContext?: {
    skillLevel?: DifficultyLevel;
    previousLessons?: string[];
    weakAreas?: string[];
  };
  sessionLengthMinutes?: number;
}

interface LessonGenerationResponse {
  lesson: SignLesson;
  suggestedFollowups: string[];
  estimatedCompletionTime: number;
}

class GeminiLessonService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelName: string;
  private maxRetries = 2; // Reduced retries to avoid wasting time
  private baseDelay = 5000; // 5 seconds - much longer for regional quota issues
  private useMockFallback = false; // Will auto-enable on quota errors

  constructor(apiKey?: string) {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    // Use gemini-3-pro-preview - latest model
    this.modelName = 'gemini-3-pro-preview';
    
    if (!key) {
      throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY in your .env file');
    }
    
    // Initialize with request options to bypass regional issues
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
    
          }

  /**
   * Retry helper with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('429') || 
                         error.message?.includes('quota') || 
                         error.message?.includes('rate limit');
      
      // If it's a rate limit and we have retries left
      if (isRateLimit && retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retryCount + 1);
      }
      
      // Otherwise, throw the error
      throw error;
    }
  }

  /**
   * Generate a complete sign language lesson
   */
  async generateLesson(request: LessonGenerationRequest): Promise<LessonGenerationResponse> {
    
    let lessonScript: LessonScript;

    try {
      // Use retry logic with exponential backoff
      lessonScript = await this.retryWithBackoff(async () => {
        // Build context-aware prompt
        const prompt = this.buildLessonPrompt(request);

        
        // Generate lesson content with Gemini using GoogleGenerativeAI
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        
        // Parse and structure the lesson
        return this.parseLessonResponse(text, request);
      });
    } catch (error: any) {
      console.error('[Gemini] API failed, using mock lesson generator:', error.message);
      
      // Parse error details
      const errorMessage = error.message || JSON.stringify(error);
      
      // Check if it's a quota error - use mock lesson to allow development
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RATE_LIMIT')) {
                                
        this.useMockFallback = true;
        lessonScript = this.generateMockLesson(request);
      } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('API_KEY')) {
        throw new Error(
          'Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file'
        );
      } else {
        // For other errors, provide helpful message
        throw new Error(`Failed to generate lesson: ${errorMessage}`);
      }
    }

    // Generate sign gestures for the lesson using CCMA
    const enrichedScript = await this.enrichWithSignGestures(lessonScript, request.signLanguage);

    // Create lesson object
    const lesson: SignLesson = {
      id: crypto.randomUUID(),
      user_id: '', // Will be set by caller
      topic: request.topic,
      subject_category: this.categorizeSubject(request.topic),
      difficulty: request.difficulty,
      sign_language: request.signLanguage,
      lesson_script: enrichedScript,
      estimated_duration_minutes: this.estimateDuration(enrichedScript, request.learningSpeed),
      gesture_count: this.countGestures(enrichedScript),
      status: 'not_started',
      completion_percentage: 0,
      cached_locally: false,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
    };

    // Generate follow-up suggestions
    const suggestedFollowups = await this.generateFollowups(request.topic, request.difficulty);

    return {
      lesson,
      suggestedFollowups,
      estimatedCompletionTime: lesson.estimated_duration_minutes,
    };
  }

  /**
   * Adapt lesson difficulty based on student performance
   */
  async adaptLessonDifficulty(
    lesson: SignLesson,
    performanceData: {
      accuracy: number;
      completionTime: number;
      struggledGestures: string[];
    }
  ): Promise<LessonScript> {
    const adjustmentPrompt = `
Analyze this sign language lesson performance and suggest adjustments:

Original Topic: ${lesson.topic}
Difficulty: ${lesson.difficulty}
Performance:
- Accuracy: ${performanceData.accuracy}%
- Completion Time: ${performanceData.completionTime} minutes
- Struggled with: ${performanceData.struggledGestures.join(', ')}

Based on this performance, should we:
1. Increase difficulty?
2. Decrease difficulty?
3. Maintain current level but reinforce weak areas?

Provide adjusted lesson content that addresses weak areas while maintaining engagement.
Focus on visual and gestural learning optimized for sign language.
`;

    const result = await this.model.generateContent(adjustmentPrompt);
    const response = await result.response;
    const text = response.text();

    return this.parseLessonResponse(text, {
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      signLanguage: lesson.sign_language,
      learningSpeed: 'medium',
    });
  }

  /**
   * Break down complex topic into micro-lessons
   */
  async createMicroLessons(
    topic: string,
    difficulty: DifficultyLevel,
    signLanguage: SignLanguageType,
    maxLessons: number = 5
  ): Promise<LessonGenerationRequest[]> {
    const prompt = `
Break down the topic "${topic}" into ${maxLessons} micro-lessons for sign language teaching.

Requirements:
- Each lesson should be 5-10 minutes
- Difficulty: ${difficulty}
- Focus on visual and gestural concepts
- Ensure logical progression
- Each lesson should be self-contained but build on previous ones

Return ONLY a JSON array of lesson topics and brief descriptions.
Format: [{"title": "...", "description": "...", "order": 1}, ...]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const microLessons = this.parseMicroLessons(text);

    return microLessons.map(ml => ({
      topic: ml.title,
      difficulty,
      signLanguage,
      learningSpeed: 'medium',
      sessionLengthMinutes: 10,
    }));
  }

  /**
   * Generate quiz questions based on lesson
   */
  async generateQuiz(lesson: SignLesson): Promise<{
    questions: Array<{
      gesture: string;
      correctAnswer: string;
      options: string[];
      explanation: string;
    }>;
  }> {
    const keyGestures = lesson.lesson_script.key_gestures;

    const prompt = `
Create a sign language quiz based on these key gestures: ${keyGestures.join(', ')}

Requirements:
- Generate 5-10 questions
- Each question shows a sign gesture (we'll render it)
- Student must select the correct meaning
- Include 3-4 plausible wrong answers per question
- Provide brief explanations
- Focus on visual recognition

Return JSON array:
[{"gesture": "...", "correctAnswer": "...", "options": ["...", "...", "...", "..."], "explanation": "..."}, ...]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseQuizQuestions(text);
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(
    userGoal: string,
    currentLevel: DifficultyLevel,
    signLanguage: SignLanguageType,
    availableTimePerWeek: number
  ): Promise<{
    weeks: Array<{
      weekNumber: number;
      topics: string[];
      estimatedHours: number;
      milestones: string[];
    }>;
    totalDuration: number;
  }> {
    const prompt = `
Create a personalized sign language learning path:

Goal: ${userGoal}
Current Level: ${currentLevel}
Sign Language: ${signLanguage}
Available Time: ${availableTimePerWeek} hours/week

Create a structured learning path that:
- Progresses logically from current level to goal
- Fits within time constraints
- Includes clear milestones
- Focuses on practical sign language communication
- Incorporates visual learning principles

Return JSON format:
{
  "weeks": [
    {
      "weekNumber": 1,
      "topics": ["...", "..."],
      "estimatedHours": 3,
      "milestones": ["..."]
    }
  ],
  "totalDuration": 12
}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseLearningPath(text);
  }

  /**
   * Simplify language for sign language teaching
   */
  async simplifyForSignLanguage(text: string, targetLevel: DifficultyLevel): Promise<string> {
    const prompt = `
Simplify this text for sign language teaching at ${targetLevel} level:

"${text}"

Requirements:
- Use simple, concrete language
- Avoid idioms and complex grammar
- Focus on visual concepts
- Keep sentence structure simple
- Maintain meaning and accuracy

Return only the simplified text.
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  }

  // Private helper methods

  private buildLessonPrompt(request: LessonGenerationRequest): string {
    const { topic, difficulty, signLanguage, learningSpeed, userContext } = request;

    let prompt = `
Create a comprehensive sign language lesson plan:

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
SIGN LANGUAGE: ${signLanguage}
LEARNING SPEED: ${learningSpeed}
SESSION LENGTH: ${request.sessionLengthMinutes || 20} minutes

`;

    if (userContext?.previousLessons && userContext.previousLessons.length > 0) {
      prompt += `
PREVIOUS LESSONS: ${userContext.previousLessons.join(', ')}
`;
    }

    if (userContext?.weakAreas && userContext.weakAreas.length > 0) {
      prompt += `
AREAS TO REINFORCE: ${userContext.weakAreas.join(', ')}
`;
    }

    prompt += `
REQUIREMENTS:
1. Create a lesson optimized for VISUAL and GESTURAL learning
2. Break content into 3-5 clear sections
3. Each section should introduce 3-5 key concepts/gestures
4. Use simple, concrete language (no idioms or complex grammar)
5. Include clear visual descriptions
6. Suggest specific sign gestures to teach
7. Build concepts progressively
8. Include opportunities for practice
9. Add memory aids and visual cues
10. Ensure accessibility for deaf/mute learners

STRUCTURE YOUR RESPONSE AS:
TITLE: [Concise lesson title]

INTRODUCTION: [Brief, visual introduction to the topic]

SECTION 1 - [Section Title]
Content: [Teaching content in simple, visual language]
Key Gestures: [List 3-5 specific words/phrases to sign]
Visual Aids: [Describe helpful diagrams or visuals]
Emphasis: [Key points to emphasize]

SECTION 2 - [Section Title]
[Same structure...]

[Continue with remaining sections...]

SUMMARY: [Brief visual recap of main concepts]

KEY GESTURES: [Complete list of all signs taught in this lesson]
`;

    return prompt;
  }

  private parseLessonResponse(text: string, request: LessonGenerationRequest): LessonScript {
    // Parse the structured response from Gemini
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let title = request.topic;
    let introduction = '';
    let summary = '';
    const sections: LessonSection[] = [];
    const keyGestures: string[] = [];

    let currentSection: Partial<LessonSection> | null = null;
    let currentField = '';

    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('INTRODUCTION:')) {
        introduction = line.replace('INTRODUCTION:', '').trim();
        currentField = 'introduction';
      } else if (line.startsWith('SUMMARY:')) {
        summary = line.replace('SUMMARY:', '').trim();
        currentField = 'summary';
      } else if (line.startsWith('SECTION')) {
        // Save previous section
        if (currentSection && currentSection.content) {
          sections.push(currentSection as LessonSection);
        }

        // Start new section
        const titleMatch = line.match(/SECTION \d+ - (.+)/);
        currentSection = {
          id: crypto.randomUUID(),
          order: sections.length,
          content: '',
          sign_sequence: [],
          visual_aids: [],
          emphasis_points: [],
        };
        currentField = 'section';
      } else if (line.startsWith('Content:')) {
        if (currentSection) {
          currentSection.content = line.replace('Content:', '').trim();
          currentField = 'content';
        }
      } else if (line.startsWith('Key Gestures:')) {
        const gestures = line.replace('Key Gestures:', '').trim()
          .split(',')
          .map(g => g.trim())
          .filter(g => g.length > 0);
        if (currentSection) {
          keyGestures.push(...gestures);
        }
        currentField = 'gestures';
      } else if (line.startsWith('Visual Aids:')) {
        currentField = 'visual_aids';
      } else if (line.startsWith('Emphasis:')) {
        if (currentSection) {
          const emphasis = line.replace('Emphasis:', '').trim();
          currentSection.emphasis_points = [emphasis];
        }
        currentField = 'emphasis';
      } else if (line.startsWith('KEY GESTURES:')) {
        const allGestures = line.replace('KEY GESTURES:', '').trim()
          .split(',')
          .map(g => g.trim())
          .filter(g => g.length > 0);
        keyGestures.push(...allGestures);
      } else {
        // Continue building current field
        if (currentField === 'introduction') {
          introduction += ' ' + line;
        } else if (currentField === 'summary') {
          summary += ' ' + line;
        } else if (currentField === 'content' && currentSection) {
          currentSection.content += ' ' + line;
        }
      }
    }

    // Save last section
    if (currentSection && currentSection.content) {
      sections.push(currentSection as LessonSection);
    }

    // Ensure we have at least one section
    if (sections.length === 0) {
      sections.push({
        id: crypto.randomUUID(),
        order: 0,
        content: introduction || text,
        sign_sequence: [],
        visual_aids: [],
        emphasis_points: [],
      });
    }

    return {
      title,
      introduction: introduction.trim(),
      sections,
      summary: summary.trim() || introduction.trim(),
      key_gestures: [...new Set(keyGestures)], // Remove duplicates
    };
  }

  private async enrichWithSignGestures(
    script: LessonScript,
    signLanguage: SignLanguageType
  ): Promise<LessonScript> {
    const ccmaService = getCCMAService();

    // Initialize CCMA if needed
    try {
      await ccmaService.initialize();
    } catch (error) {
            return script;
    }

    // Generate gestures for key concepts
    const enrichedSections = await Promise.all(
      script.sections.map(async section => {
        const gestures = await Promise.all(
          script.key_gestures.slice(0, 5).map(async gesture => {
            try {
              return await ccmaService.generateGesture(gesture, signLanguage);
            } catch (error) {
                            return null;
            }
          })
        );

        return {
          ...section,
          sign_sequence: gestures.filter(g => g !== null) as any[],
        };
      })
    );

    return {
      ...script,
      sections: enrichedSections,
    };
  }

  private categorizeSubject(topic: string): string {
    const topicLower = topic.toLowerCase();

    if (topicLower.includes('math') || topicLower.includes('algebra') || topicLower.includes('calculus')) {
      return 'Mathematics';
    } else if (topicLower.includes('science') || topicLower.includes('biology') || topicLower.includes('physics')) {
      return 'Science';
    } else if (topicLower.includes('history') || topicLower.includes('geography')) {
      return 'Social Studies';
    } else if (topicLower.includes('language') || topicLower.includes('literature') || topicLower.includes('writing')) {
      return 'Language Arts';
    } else if (topicLower.includes('art') || topicLower.includes('music')) {
      return 'Arts';
    } else if (topicLower.includes('computer') || topicLower.includes('programming')) {
      return 'Technology';
    } else {
      return 'General';
    }
  }

  private estimateDuration(script: LessonScript, speed: LearningSpeed): number {
    const baseMinutes = script.sections.length * 5; // 5 minutes per section
    const gestureCount = script.key_gestures.length;
    const practiceTime = Math.ceil(gestureCount / 3) * 2; // 2 minutes per 3 gestures

    let total = baseMinutes + practiceTime;

    // Adjust for learning speed
    if (speed === 'slow') {
      total *= 1.5;
    } else if (speed === 'fast') {
      total *= 0.75;
    }

    return Math.ceil(total);
  }

  private countGestures(script: LessonScript): number {
    return script.key_gestures.length;
  }

  private async generateFollowups(topic: string, difficulty: DifficultyLevel): Promise<string[]> {
    const prompt = `
Given the topic "${topic}" at ${difficulty} level, suggest 3 related follow-up topics that would be good next lessons for sign language learning.

Return only a JSON array of strings: ["Topic 1", "Topic 2", "Topic 3"]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const match = text.match(/\[.*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
          }

    return [
      `${topic} - Advanced Concepts`,
      `${topic} - Practice Exercises`,
      `${topic} - Real-world Applications`,
    ];
  }

  private parseMicroLessons(text: string): Array<{ title: string; description: string; order: number }> {
    try {
      const match = text.match(/\[.*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
          }

    return [
      { title: 'Introduction', description: 'Basic concepts', order: 1 },
      { title: 'Core Concepts', description: 'Main ideas', order: 2 },
      { title: 'Practice', description: 'Apply knowledge', order: 3 },
    ];
  }

  private parseQuizQuestions(text: string): any {
    try {
      const match = text.match(/\[.*\]/s);
      if (match) {
        return { questions: JSON.parse(match[0]) };
      }
    } catch (error) {
          }

    return { questions: [] };
  }

  private parseLearningPath(text: string): any {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
          }

    return {
      weeks: [
        {
          weekNumber: 1,
          topics: ['Getting Started'],
          estimatedHours: 3,
          milestones: ['Basic signs learned'],
        },
      ],
      totalDuration: 4,
    };
  }

  /**
   * Generate a mock lesson when API fails
   */
  private generateMockLesson(request: LessonGenerationRequest): LessonScript {
    const { topic, difficulty } = request;
    
    const mockLessons: Record<string, any> = {
      'Photosynthesis': {
        title: 'Introduction to Photosynthesis',
        introduction: 'Photosynthesis is the process plants use to convert sunlight into energy. This visual lesson will teach you the key concepts through sign language.',
        sections: [
          {
            id: crypto.randomUUID(),
            order: 0,
            content: 'Plants are living organisms that can make their own food. They use sunlight, water, and carbon dioxide to create glucose and oxygen. This process is called photosynthesis.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Plants make their own food', 'Sunlight is essential', 'Oxygen is produced'],
          },
          {
            id: crypto.randomUUID(),
            order: 1,
            content: 'Chlorophyll is the green pigment in plant leaves. It captures light energy from the sun. The chloroplasts in plant cells contain chlorophyll and are where photosynthesis happens.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Chlorophyll is green', 'Found in leaves', 'Captures sunlight'],
          },
          {
            id: crypto.randomUUID(),
            order: 2,
            content: 'Plants absorb water through their roots and carbon dioxide through tiny holes in their leaves called stomata. With sunlight energy, they combine these to make glucose sugar for food.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Roots absorb water', 'Leaves take in CO2', 'Glucose is produced'],
          },
        ],
        summary: 'Photosynthesis is how plants make food using sunlight, water, and carbon dioxide. Chlorophyll in leaves captures sunlight energy to produce glucose and oxygen.',
        key_gestures: ['plant', 'sunlight', 'water', 'oxygen', 'leaf', 'green', 'energy', 'food', 'grow'],
      },
      'Human Biology': {
        title: 'Introduction to Human Biology',
        introduction: 'Human biology studies how our body works. Learn about body systems and organs through visual sign language.',
        sections: [
          {
            id: crypto.randomUUID(),
            order: 0,
            content: 'The human body is made of many systems working together. Each system has specific organs that perform important functions to keep us alive and healthy.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Body has multiple systems', 'Organs work together', 'Keep us healthy'],
          },
          {
            id: crypto.randomUUID(),
            order: 1,
            content: 'The heart pumps blood throughout the body. Blood carries oxygen and nutrients to all cells. The circulatory system includes the heart, blood vessels, and blood.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Heart pumps blood', 'Blood carries oxygen', 'Reaches all cells'],
          },
          {
            id: crypto.randomUUID(),
            order: 2,
            content: 'The lungs help us breathe. We inhale oxygen from the air and exhale carbon dioxide. The respiratory system allows gas exchange in our bodies.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Lungs for breathing', 'Oxygen in, CO2 out', 'Gas exchange'],
          },
        ],
        summary: 'Human biology teaches us about body systems like circulation and respiration. Understanding how organs work helps us stay healthy.',
        key_gestures: ['body', 'heart', 'lungs', 'blood', 'breathe', 'oxygen', 'healthy', 'system', 'organ'],
      },
      'Basic Mathematics': {
        title: 'Introduction to Basic Math',
        introduction: 'Mathematics is the study of numbers, shapes, and patterns. Learn fundamental math concepts through visual sign language.',
        sections: [
          {
            id: crypto.randomUUID(),
            order: 0,
            content: 'Numbers are symbols we use to count and measure. We can add numbers together to find the total. We can subtract to find the difference between numbers.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Numbers represent quantity', 'Addition combines', 'Subtraction removes'],
          },
          {
            id: crypto.randomUUID(),
            order: 1,
            content: 'Multiplication is repeated addition. When we multiply two numbers, we add one number to itself multiple times. Division splits a number into equal parts.',
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Multiplication repeats', 'Division splits equally', 'Inverse operations'],
          },
        ],
        summary: 'Basic math includes addition, subtraction, multiplication, and division. These operations help us solve problems with numbers.',
        key_gestures: ['number', 'add', 'subtract', 'multiply', 'divide', 'equal', 'more', 'less', 'total'],
      },
    };

    // Find matching mock or create generic one
    let mockData = mockLessons[topic];
    
    if (!mockData) {
      // Generic mock lesson
      mockData = {
        title: `Introduction to ${topic}`,
        introduction: `This lesson teaches you about ${topic} using visual sign language. Learn key concepts adapted to ${difficulty} level.`,
        sections: [
          {
            id: crypto.randomUUID(),
            order: 0,
            content: `${topic} is an important subject. We will explore the fundamental concepts in a visual, easy-to-understand way using sign language.`,
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
          },
          {
            id: crypto.randomUUID(),
            order: 1,
            content: `Let's dive deeper into ${topic}. Visual learning helps us understand complex ideas through gestures and signs.`,
            sign_sequence: [],
            visual_aids: [],
            emphasis_points: ['Important point 1', 'Important point 2'],
          },
        ],
        summary: `${topic} can be learned effectively through sign language and visual methods.`,
        key_gestures: ['learn', 'understand', 'important', 'remember', 'practice', 'study'],
      };
    }

    return mockData as LessonScript;
  }
}

// Singleton instance
let geminiServiceInstance: GeminiLessonService | null = null;

export function getGeminiLessonService(): GeminiLessonService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiLessonService();
  }
  return geminiServiceInstance;
}

export { GeminiLessonService };


