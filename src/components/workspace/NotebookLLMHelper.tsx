/**
 * Production NotebookLLM Helper (Gemini + PPTX Export)
 * 
 * PRODUCTION FEATURES:
 * - Real Gemini API for slide generation
 * - JSON to PPTX conversion (download-ready)
 * - Context-aware slide content  
 * - Subject-agnostic (works for ANY topic)
 * - Speaker notes generation
 * - Production error handling
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Presentation, Sparkles, Download, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';
import { buildSpaceContext, buildSystemPrompt } from '@/services/contextService';
import { apiService } from '@/services/apiService';
import type { Helper, Space } from '@/types/unifiedOS';

interface NotebookLLMHelperProps {
  helper: Helper;
  space: Space;
}

interface Slide {
  id: string;
  title: string;
  content: string[];
  speakerNotes: string;
}

interface SlideGenerationResponse {
  slides: Slide[];
}


export default function NotebookLLMHelper({ helper, space }: NotebookLLMHelperProps) {
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate slides using Gemini API
   */
  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedSlides = await generateSlidesWithGemini(topic, space);
      setSlides(generatedSlides);
    } catch (err) {
      console.error('[NotebookLLM] Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate slides');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Export slides to PPTX
   */
  const handleExport = async () => {
    if (slides.length === 0) return;

    setIsExporting(true);
    try {
      await exportToPPTX(slides, topic, space);
    } catch (err) {
      console.error('[NotebookLLM] Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export presentation');
    } finally {
      setIsExporting(false);
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: ['Add your content here...'],
      speakerNotes: '',
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: keyof Slide, value: any) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const deleteSlide = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Presentation className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100">NotebookLLM</h3>
            <p className="text-xs text-gray-500">
              AI Presentation Generator for {space.subject}
            </p>
          </div>
          {slides.length > 0 && (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export PPTX
            </Button>
          )}
        </div>

        {/* Topic Input */}
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`Enter topic for ${space.subject} presentation...`}
            className="flex-1 bg-[#1a1a1a] border-gray-800 text-gray-100"
            disabled={isGenerating}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Slides
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Slides */}
      <div className="flex-1 overflow-y-auto p-4">
        {slides.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Presentation className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Generate a Presentation
              </h4>
              <p className="text-sm text-gray-500">
                Enter a topic and I'll create professional slides with speaker notes for your {space.subject} presentation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    Slide {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSlide(slide.id)}
                    className="text-gray-500 hover:text-red-400 h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Title */}
                <Input
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  className="mb-3 bg-[#0f0f0f] border-gray-800 text-gray-100 font-semibold"
                  placeholder="Slide title"
                />

                {/* Content */}
                <div className="mb-3">
                  {slide.content.map((bullet, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <span className="text-gray-600 mt-2">•</span>
                      <Textarea
                        value={bullet}
                        onChange={(e) => {
                          const newContent = [...slide.content];
                          newContent[i] = e.target.value;
                          updateSlide(slide.id, 'content', newContent);
                        }}
                        className="flex-1 bg-[#0f0f0f] border-gray-800 text-gray-100 min-h-[60px]"
                        placeholder="Bullet point"
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateSlide(slide.id, 'content', [...slide.content, ''])
                    }
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add bullet
                  </Button>
                </div>

                {/* Speaker Notes */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Speaker Notes
                  </label>
                  <Textarea
                    value={slide.speakerNotes}
                    onChange={(e) =>
                      updateSlide(slide.id, 'speakerNotes', e.target.value)
                    }
                    className="bg-[#0f0f0f] border-gray-800 text-gray-100 text-sm min-h-[80px]"
                    placeholder="Notes for the presenter..."
                  />
                </div>
              </div>
            ))}

            <Button
              onClick={addSlide}
              variant="outline"
              className="w-full border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate slides using Gemini API (PRODUCTION)
 */
async function generateSlidesWithGemini(
  topic: string,
  space: Space
): Promise<Slide[]> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const context = buildSpaceContext(space.id, {
    includeNotes: true,
    maxNotes: 3,
  });

  if (!context) {
    throw new Error('Failed to build context');
  }

  const systemPrompt = buildSystemPrompt('notebookllm', context);

  const userPrompt = `Create a professional presentation about "${topic}" in ${space.subject}.

Generate 5-7 slides with:
1. A clear title for each slide
2. 3-5 bullet points per slide (concise, educational)
3. Speaker notes for each slide (2-3 sentences)

Structure:
- Slide 1: Introduction
- Slides 2-5: Core content
- Last slide: Summary/Conclusion

Return ONLY valid JSON in this exact format:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "speakerNotes": "Notes for the presenter"
    }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await apiService.request<any>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    },
    { skipCache: true }
  );

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  const text = response.candidates[0].content.parts[0].text;

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  const parsed: SlideGenerationResponse = JSON.parse(jsonText);

  // Add IDs to slides
  return parsed.slides.map((slide, i) => ({
    ...slide,
    id: `slide-${Date.now()}-${i}`,
  }));
}

/**
 * Export slides to PPTX (PRODUCTION)
 */
async function exportToPPTX(
  slides: Slide[],
  topic: string,
  space: Space
): Promise<void> {
  const pptx = new PptxGenJS();

  // Presentation metadata
  pptx.author = 'EdTech Unified OS';
  pptx.title = `${topic} - ${space.subject}`;
  pptx.subject = space.subject;

  // Define theme colors
  const theme = {
    background: '0F0F0F',
    text: 'FFFFFF',
    accent: 'A855F7', // Purple
    secondary: 'EC4899', // Pink
  };

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: theme.background };
  titleSlide.addText(topic, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: theme.text,
    align: 'center',
  });
  titleSlide.addText(space.subject, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: theme.accent,
    align: 'center',
  });

  // Content slides
  slides.forEach((slide) => {
    const contentSlide = pptx.addSlide();
    contentSlide.background = { color: theme.background };

    // Title
    contentSlide.addText(slide.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 32,
      bold: true,
      color: theme.accent,
    });

    // Content bullets
    const bulletText = slide.content
      .filter((c) => c.trim())
      .map((c) => ({ text: c, options: { bullet: true } }));

    if (bulletText.length > 0) {
      contentSlide.addText(bulletText, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: theme.text,
        lineSpacing: 28,
      });
    }

    // Speaker notes
    if (slide.speakerNotes) {
      contentSlide.addNotes(slide.speakerNotes);
    }
  });

  // Export
  const fileName = `${topic.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx`;
  await pptx.writeFile({ fileName });
}
