import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DifficultyLevel, ToneType, DIFFICULTY_LEVELS, TONE_OPTIONS } from '@/mocks/adaptiveContent';
import { GraduationCap, MessageCircle } from 'lucide-react';

interface DifficultyToneSelectorProps {
  difficulty: DifficultyLevel;
  tone: ToneType;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onToneChange: (tone: ToneType) => void;
}

export const DifficultyToneSelector: React.FC<DifficultyToneSelectorProps> = ({
  difficulty,
  tone,
  onDifficultyChange,
  onToneChange,
}) => {
  const difficultyIndex = DIFFICULTY_LEVELS.findIndex((d) => d.value === difficulty);

  const handleSliderChange = (value: number[]) => {
    const newDifficulty = DIFFICULTY_LEVELS[value[0]];
    if (newDifficulty) {
      onDifficultyChange(newDifficulty.value);
    }
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    const colors: Record<DifficultyLevel, string> = {
      elementary: '#6DAEDB',
      middle: '#C9B458',
      high: '#C27BA0',
      college: '#C9B458',
      graduate: '#C27BA0',
    };
    return colors[level];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Difficulty Selector */}
      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-[#C9B458]" />
          <h3 className="text-sm font-black text-white uppercase">Difficulty Level</h3>
        </div>

        <div className="space-y-4">
          <Slider
            value={[difficultyIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={DIFFICULTY_LEVELS.length - 1}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between text-xs">
            {DIFFICULTY_LEVELS.map((level, index) => (
              <motion.span
                key={level.value}
                animate={{
                  color: index === difficultyIndex ? getDifficultyColor(level.value) : '#9CA3AF',
                  scale: index === difficultyIndex ? 1.1 : 1,
                }}
                className="font-bold"
              >
                {level.label.split(' ')[0]}
              </motion.span>
            ))}
          </div>

          <div className="p-3 border-2 border-white/20 bg-black/30 text-center">
            <p className="text-white font-black text-lg">
              {DIFFICULTY_LEVELS[difficultyIndex].label}
            </p>
          </div>
        </div>
      </Card>

      {/* Tone Selector */}
      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-[#C27BA0]" />
          <h3 className="text-sm font-black text-white uppercase">Explanation Tone</h3>
        </div>

        <Select value={tone} onValueChange={(value) => onToneChange(value as ToneType)}>
          <SelectTrigger className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black/50 text-white font-bold h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-4 border-black bg-obsidian">
            {TONE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-white font-bold hover:bg-[#C27BA0] hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-3 p-3 border-2 border-[#C27BA0]/30 bg-[#C27BA0]/10">
          <p className="text-xs text-white/80">
            {tone === 'casual' && 'Friendly and conversational explanations'}
            {tone === 'academic' && 'Formal, precise technical language'}
            {tone === 'humorous' && 'Fun, engaging with jokes and references'}
            {tone === 'eli5' && 'Simple explanations anyone can understand'}
            {tone === 'professional' && 'Business-appropriate and polished'}
          </p>
        </div>
      </Card>
    </div>
  );
};
