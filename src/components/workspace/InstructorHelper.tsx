/**
 * Production Instructor Helper (Teacher Directory & Q&A)
 * 
 * PRODUCTION FEATURES:
 * - Browse available teachers by domain/subject
 * - View teacher profiles (experience, specialties, ratings)
 * - Select a teacher and ask questions
 * - Real Gemini API simulates teacher personality
 * - Teacher-specific conversation context
 * - Production error handling
 */

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { buildSpaceContext } from '@/services/contextService';
import { apiService } from '@/services/apiService';
import { UserCircle, Send, Loader2, Star, Award, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Helper, Space, ChatMessage } from '@/types/unifiedOS';
import ReactMarkdown from 'react-markdown';

// Teacher interface
interface Teacher {
  id: string;
  name: string;
  avatar: string;
  experience: number;
  rating: number;
  specialties: string[];
  bio: string;
  studentsCount: number;
}

// Production teacher directory - organized by subject domain
const TEACHER_DIRECTORY: Record<string, Teacher[]> = {
  'Computer Science': [
    { id: 't1', name: 'Alex Thompson', avatar: '👨‍💻', experience: 8, rating: 4.9, specialties: ['Algorithms', 'Data Structures', 'Web Development'], bio: 'Full-stack developer turned educator. Specializes in making complex CS concepts accessible.', studentsCount: 256 },
    { id: 't2', name: 'Dr. Sarah Chen', avatar: '👩‍💼', experience: 12, rating: 4.8, specialties: ['Machine Learning', 'AI', 'Python'], bio: 'PhD in Computer Science. Expert in AI/ML with industry experience at top tech companies.', studentsCount: 342 },
    { id: 't3', name: 'Marcus Johnson', avatar: '👨‍🏫', experience: 6, rating: 4.7, specialties: ['JavaScript', 'React', 'Node.js'], bio: 'Modern web development expert. Teaches the latest frameworks and best practices.', studentsCount: 189 },
  ],
  'Mathematics': [
    { id: 't4', name: 'Dr. Emily Watson', avatar: '👩‍🏫', experience: 15, rating: 5.0, specialties: ['Calculus', 'Linear Algebra', 'Statistics'], bio: 'Award-winning math professor. Patient approach to building strong mathematical foundations.', studentsCount: 415 },
    { id: 't5', name: 'Prof. David Lee', avatar: '👨‍🔬', experience: 20, rating: 4.9, specialties: ['Number Theory', 'Discrete Math', 'Proofs'], bio: 'Published researcher with decades of teaching experience. Makes abstract concepts concrete.', studentsCount: 298 },
  ],
  'Physics': [
    { id: 't6', name: 'Dr. Maria Rodriguez', avatar: '👩‍🔬', experience: 18, rating: 4.8, specialties: ['Quantum Physics', 'Mechanics', 'Electromagnetism'], bio: 'Experimental physicist with passion for teaching. Uses real-world examples extensively.', studentsCount: 267 },
    { id: 't7', name: 'Dr. James Park', avatar: '👨‍🎓', experience: 10, rating: 4.7, specialties: ['Classical Physics', 'Thermodynamics', 'Optics'], bio: 'Clear explanations and practical problem-solving approach. Great for exam preparation.', studentsCount: 198 },
  ],
  'Chemistry': [
    { id: 't8', name: 'Dr. Lisa Anderson', avatar: '👩‍🔬', experience: 14, rating: 4.9, specialties: ['Organic Chemistry', 'Biochemistry', 'Lab Techniques'], bio: 'Industry chemist and educator. Connects theory to real-world applications.', studentsCount: 234 },
  ],
  'Biology': [
    { id: 't9', name: 'Dr. Robert Kim', avatar: '👨‍⚕️', experience: 16, rating: 4.8, specialties: ['Molecular Biology', 'Genetics', 'Anatomy'], bio: 'Medical school professor. Excellent at explaining complex biological systems.', studentsCount: 312 },
  ],
  'default': [
    { id: 't10', name: 'Prof. Michael Brown', avatar: '👨‍🏫', experience: 12, rating: 4.7, specialties: ['General Studies', 'Critical Thinking', 'Research Methods'], bio: 'Interdisciplinary educator. Helps students across all subjects develop strong learning habits.', studentsCount: 445 },
    { id: 't11', name: 'Dr. Jennifer White', avatar: '👩‍💼', experience: 10, rating: 4.8, specialties: ['Study Skills', 'Time Management', 'Academic Writing'], bio: 'Learning strategist. Focuses on developing effective study techniques and productivity.', studentsCount: 378 },
  ],
};

interface InstructorHelperProps {
  helper: Helper;
  space: Space;
}

export default function InstructorHelper({ helper, space }: InstructorHelperProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get teachers for this subject
  const availableTeachers = TEACHER_DIRECTORY[space.subject] || TEACHER_DIRECTORY.default;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedTeacher) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      space_id: space.id,
      helper_id: helper.id,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await askTeacher(selectedTeacher, input.trim(), space, messages);
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        space_id: space.id,
        helper_id: helper.id,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('[Instructor] Error:', err);
      setError(err.message || 'Failed to get response from teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setMessages([]);
    setError(null);
  };

  const goBack = () => {
    setSelectedTeacher(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          {selectedTeacher && (
            <Button
              size="sm"
              variant="ghost"
              onClick={goBack}
              className="text-gray-400 hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100">
              {selectedTeacher ? selectedTeacher.name : (helper.name || 'Instructor')}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedTeacher ? `${selectedTeacher.experience} years experience` : 'Choose a teacher'}
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
            {space.subject}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto">
          {!selectedTeacher ? (
            /* Teacher List */
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Available Teachers</h2>
                <p className="text-gray-400">Select a teacher to ask your questions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTeachers.map((teacher) => (
                  <Card
                    key={teacher.id}
                    className="bg-[#141414] border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                    onClick={() => selectTeacher(teacher)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{teacher.avatar}</div>
                        <div className="flex-1">
                          <CardTitle className="text-gray-100 mb-2">{teacher.name}</CardTitle>
                          
                          <div className="flex items-center gap-3 mb-3 text-sm">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span>{teacher.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Award className="h-4 w-4" />
                              <span>{teacher.experience} years</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Users className="h-4 w-4" />
                              <span>{teacher.studentsCount}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {teacher.specialties.slice(0, 3).map((specialty) => (
                              <Badge
                                key={specialty}
                                variant="outline"
                                className="border-gray-700 text-gray-400 text-xs"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <CardDescription className="text-gray-500 text-sm">
                            {teacher.bio}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Teacher Info Banner */}
              <Card className="bg-[#141414] border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedTeacher.avatar}</div>
                    <div>
                      <CardTitle className="text-gray-100 text-lg">{selectedTeacher.name}</CardTitle>
                      <p className="text-sm text-gray-500">{selectedTeacher.specialties.join(', ')}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Messages */}
              <div className="space-y-4 min-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">{selectedTeacher.avatar}</div>
                    <h4 className="text-lg font-semibold text-gray-300 mb-2">
                      Ask {selectedTeacher.name.split(' ')[0]} anything!
                    </h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      {selectedTeacher.bio}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="text-2xl flex-shrink-0">{selectedTeacher.avatar}</div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#1a1a1a] border border-gray-800 text-gray-100'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-100">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc ml-4 mb-2 text-gray-100">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 text-gray-100">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              code: ({ inline, children, ...props }: any) =>
                                inline ? (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-sm text-emerald-400" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-gray-900 p-2 rounded text-sm overflow-x-auto" {...props}>
                                    {children}
                                  </code>
                                ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">{selectedTeacher.avatar}</div>
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input (only show when teacher is selected) */}
      {selectedTeacher && (
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedTeacher.name.split(' ')[0]} a question...`}
              className="flex-1 min-h-[80px] bg-[#1a1a1a] border-gray-800 text-gray-100 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="self-end bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2 max-w-4xl mx-auto">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Ask teacher using Gemini API (simulates teacher personality)
 */
async function askTeacher(
  teacher: Teacher,
  question: string,
  space: Space,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const context = buildSpaceContext(space.id, {
    includeNotes: true,
    maxNotes: 3,
  });

  // Build teacher-specific system prompt
  const systemPrompt = `You are ${teacher.name}, an experienced educator with ${teacher.experience} years of teaching experience.

YOUR EXPERTISE:
${teacher.specialties.map(s => `- ${s}`).join('\n')}

YOUR TEACHING STYLE:
${teacher.bio}

STUDENT CONTEXT:
- Subject: ${space.subject}
- Topic: ${space.topic}
- Learning Goal: ${space.learning_goal}
- Level: ${space.level}

As ${teacher.name}, you should:
1. Answer questions clearly and thoroughly
2. Use examples and analogies relevant to your specialties
3. Provide step-by-step explanations when needed
4. Encourage critical thinking
5. Stay in character as this specific teacher
6. Be supportive and patient

Always sign your responses naturally as yourself.`;

  // Build conversation history for Gemini
  const history = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await apiService.request<any>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          ...history,
          {
            role: 'user',
            parts: [{ text: question }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    },
    {
      skipCache: true,
      cacheKey: `teacher-${teacher.id}-${Date.now()}`,
    }
  );

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No response from teacher');
  }

  return response.candidates[0].content.parts[0].text;
}
