import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameQuestion } from '@/mocks/game';
import { Clock, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface QuestionPanelProps {
  question: GameQuestion;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionPanel = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions
}: QuestionPanelProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [question.id]);

  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeElapsed(0);
  }, [question.id]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const isCorrect = index === question.correctAnswer;
    setShowExplanation(true);
    
    setTimeout(() => {
      onAnswer(index, isCorrect);
    }, 2000);
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'EASY': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500';
      case 'HARD': return 'bg-red-500/20 text-red-400 border-red-500';
    }
  };

  const getCategoryColor = () => {
    switch (question.category) {
      case 'MATH': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'SCIENCE': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'HISTORY': return 'bg-amber-500/20 text-amber-400 border-amber-500';
      case 'ENGLISH': return 'bg-pink-500/20 text-pink-400 border-pink-500';
      case 'GENERAL': return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getOptionStyle = (index: number) => {
    if (selectedOption === null) {
      return 'border-gray-700 hover:border-[#C9B458] hover:bg-[#C9B458]/10';
    }
    
    if (index === question.correctAnswer) {
      return 'border-green-500 bg-green-500/20';
    }
    
    if (index === selectedOption && index !== question.correctAnswer) {
      return 'border-red-500 bg-red-500/20';
    }
    
    return 'border-gray-700 opacity-50';
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[#C9B458]/20 border-[#C9B458] text-[#C9B458]">
                Question {questionNumber}/{totalQuestions}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor()}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className={getCategoryColor()}>
                {question.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{timeElapsed}s</span>
            </div>
          </div>
          
          <CardTitle className="text-xl text-white leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${getOptionStyle(index)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-white flex-1">{option}</span>
                  
                  {selectedOption !== null && index === question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  
                  {selectedOption === index && index !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-blue-400 text-sm">Explanation</h4>
                    <p className="text-sm text-gray-300">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
