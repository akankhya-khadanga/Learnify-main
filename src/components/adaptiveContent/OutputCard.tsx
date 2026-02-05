import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ReelsContent, 
  MemeContent, 
  CharacterContent, 
  NotesContent, 
  ExamContent,
  GeneratedContent 
} from '@/mocks/adaptiveContent';
import { 
  Video, 
  Smile, 
  Users, 
  FileText, 
  Award, 
  Copy, 
  RefreshCw,
  Clock,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OutputCardProps {
  content: GeneratedContent;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export const OutputCard: React.FC<OutputCardProps> = ({ content, onRegenerate, isLoading }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    const text = JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Copied!',
      description: 'Content copied to clipboard',
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 animate-pulse rounded"></div>
          <div className="h-32 bg-white/10 animate-pulse rounded"></div>
          <div className="h-20 bg-white/10 animate-pulse rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian">
        {/* Header with actions */}
        <div className="border-b-4 border-black p-4 bg-black/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {content.style === 'reels' && <Video className="w-5 h-5 text-[#C9B458]" />}
            {content.style === 'meme' && <Smile className="w-5 h-5 text-[#C27BA0]" />}
            {content.style === 'character' && <Users className="w-5 h-5 text-[#6DAEDB]" />}
            {content.style === 'notes' && <FileText className="w-5 h-5 text-[#C9B458]" />}
            {content.style === 'exam' && <Award className="w-5 h-5 text-[#C27BA0]" />}
            <h3 className="font-black text-white">
              {content.style === 'reels' && 'Reels Script'}
              {content.style === 'meme' && 'Meme Format'}
              {content.style === 'character' && 'Character Dialogue'}
              {content.style === 'notes' && 'Study Notes'}
              {content.style === 'exam' && 'Exam Prep'}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCopy}
              className="border-2 border-black bg-[#6DAEDB] hover:bg-[#5C9DCA] text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {onRegenerate && (
              <Button
                size="sm"
                onClick={onRegenerate}
                className="border-2 border-black bg-[#C27BA0] hover:bg-[#B16A8F] text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          {content.style === 'reels' && <ReelsOutput content={content} />}
          {content.style === 'meme' && <MemeOutput content={content} />}
          {content.style === 'character' && <CharacterOutput content={content} />}
          {content.style === 'notes' && <NotesOutput content={content} />}
          {content.style === 'exam' && <ExamOutput content={content} />}
        </div>
      </Card>
    </motion.div>
  );
};

// Reels format component
const ReelsOutput: React.FC<{ content: ReelsContent }> = ({ content }) => (
  <div className="space-y-4">
    <div className="p-4 border-4 border-[#C9B458] bg-[#C9B458]/10">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-[#C9B458]" />
        <h4 className="font-black text-white">{content.title}</h4>
      </div>
      <p className="text-[#C9B458] font-bold text-lg">{content.hook}</p>
    </div>

    <div className="space-y-3">
      {content.segments.map((segment, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-3 p-3 border-2 border-white/20 bg-black/30 rounded"
        >
          <div className="flex items-center gap-2 text-[#C9B458] min-w-[80px]">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">{segment.timestamp}</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold mb-1">{segment.text}</p>
            <p className="text-white/60 text-xs">Visual: {segment.visual}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="p-3 border-2 border-[#C9B458] bg-black/30 text-center">
      <p className="text-white font-bold">{content.cta}</p>
      <Badge className="mt-2 bg-[#C9B458] text-black border-2 border-black font-black">
        Duration: {content.duration}
      </Badge>
    </div>
  </div>
);

// Meme format component
const MemeOutput: React.FC<{ content: MemeContent }> = ({ content }) => (
  <div className="space-y-4">
    <div className="border-4 border-black bg-gradient-to-b from-white to-gray-200 p-8 text-center">
      <div className="mb-8">
        <p className="text-4xl font-black text-black uppercase">{content.topText}</p>
      </div>
      <div className="my-8 h-48 border-4 border-black bg-[#C27BA0]/20 flex items-center justify-center">
        <p className="text-6xl">{content.template === 'Drake Pointing' ? '👈' : '🖼️'}</p>
      </div>
      <div className="mt-8">
        <p className="text-4xl font-black text-black uppercase">{content.bottomText}</p>
      </div>
    </div>
    <div className="p-4 border-l-4 border-[#C27BA0] bg-black/30">
      <p className="text-sm text-white/80 italic">{content.context}</p>
    </div>
  </div>
);

// Character dialogue component
const CharacterOutput: React.FC<{ content: CharacterContent }> = ({ content }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Users className="w-5 h-5 text-[#6DAEDB]" />
      <p className="text-white/60 text-sm font-bold">
        Setting: {content.setting} • Characters: {content.characters.join(', ')}
      </p>
    </div>

    <div className="space-y-3">
      {content.dialogue.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: line.speaker === content.characters[0] ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 }}
          className={`p-4 border-4 border-black ${
            index % 2 === 0 ? 'bg-[#6DAEDB]/20 ml-0 mr-8' : 'bg-[#C27BA0]/20 ml-8 mr-0'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              className="border-2 border-black font-black"
              style={{ 
                backgroundColor: index % 2 === 0 ? '#6DAEDB' : '#C27BA0',
                color: 'black'
              }}
            >
              {line.speaker}
            </Badge>
            {line.emotion && (
              <span className="text-xs text-white/60 italic">*{line.emotion}*</span>
            )}
          </div>
          <p className="text-white font-bold leading-relaxed">{line.text}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

// Notes format component
const NotesOutput: React.FC<{ content: NotesContent }> = ({ content }) => (
  <div className="space-y-4">
    <h4 className="text-2xl font-black text-white border-b-4 border-[#C9B458] pb-2">
      {content.title}
    </h4>

    <div className="space-y-2">
      <h5 className="text-sm font-black text-[#C9B458] uppercase">Key Points</h5>
      {content.keyPoints.map((point, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#C9B458] mt-1 flex-shrink-0" />
          <p className="text-white text-sm">{point}</p>
        </motion.div>
      ))}
    </div>

    {content.formulas && content.formulas.length > 0 && (
      <div className="p-4 border-4 border-[#C9B458] bg-black/50">
        <h5 className="text-sm font-black text-[#C9B458] uppercase mb-2">Key Formulas</h5>
        {content.formulas.map((formula, index) => (
          <p key={index} className="font-mono text-white bg-black/50 p-2 mb-2 border-2 border-white/20">
            {formula}
          </p>
        ))}
      </div>
    )}

    {content.examples && content.examples.length > 0 && (
      <div className="space-y-2">
        <h5 className="text-sm font-black text-[#6DAEDB] uppercase">Examples</h5>
        {content.examples.map((example, index) => (
          <p key={index} className="text-white/80 text-sm bg-black/30 p-3 border-l-4 border-[#6DAEDB]">
            {example}
          </p>
        ))}
      </div>
    )}

    <div className="p-4 border-2 border-white/20 bg-black/20">
      <p className="text-white/90 text-sm italic">{content.summary}</p>
    </div>
  </div>
);

// Exam prep component
const ExamOutput: React.FC<{ content: ExamContent }> = ({ content }) => (
  <div className="space-y-4">
    <h4 className="text-2xl font-black text-white border-b-4 border-[#C27BA0] pb-2">
      {content.title}
    </h4>

    <div className="space-y-3">
      <h5 className="text-sm font-black text-[#C27BA0] uppercase">Practice Questions</h5>
      {content.questions.map((q, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 border-4 border-black bg-black/30"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-bold text-white">Q{index + 1}: {q.question}</p>
            <Badge 
              className="border-2 border-black font-black flex-shrink-0"
              style={{ 
                backgroundColor: 
                  q.difficulty === 'Easy' ? '#6DAEDB' : 
                  q.difficulty === 'Medium' ? '#C9B458' : '#C27BA0',
                color: 'black'
              }}
            >
              {q.difficulty}
            </Badge>
          </div>
          <p className="text-[#C9B458] text-sm font-bold mt-2">💡 {q.answer}</p>
        </motion.div>
      ))}
    </div>

    <div className="p-4 border-4 border-[#C27BA0] bg-[#C27BA0]/10">
      <h5 className="text-sm font-black text-[#C27BA0] uppercase mb-2">Key Formulas</h5>
      {content.keyFormulas.map((formula, index) => (
        <p key={index} className="font-mono text-white bg-black/50 p-2 mb-2 border-2 border-[#C27BA0]">
          {formula}
        </p>
      ))}
    </div>

    <div className="space-y-2">
      <h5 className="text-sm font-black text-[#6DAEDB] uppercase">Study Tips</h5>
      {content.studyTips.map((tip, index) => (
        <div key={index} className="flex items-start gap-2 p-2">
          <Zap className="w-4 h-4 text-[#6DAEDB] mt-1 flex-shrink-0" />
          <p className="text-white/90 text-sm">{tip}</p>
        </div>
      ))}
    </div>
  </div>
);
