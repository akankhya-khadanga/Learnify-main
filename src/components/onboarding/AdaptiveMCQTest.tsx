import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mcqQuestions, MCQQuestion } from '@/mocks/onboarding';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface AdaptiveMCQTestProps {
  onComplete: (responses: boolean[]) => void;
}

export default function AdaptiveMCQTest({ onComplete }: AdaptiveMCQTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [questionSequence] = useState<MCQQuestion[]>(() => {
    // Adaptive sequence: start with easy, then branch
    const easy = mcqQuestions.filter(q => q.difficulty === 'easy').slice(0, 2);
    const medium = mcqQuestions.filter(q => q.difficulty === 'medium').slice(0, 2);
    const hard = mcqQuestions.filter(q => q.difficulty === 'hard').slice(0, 1);
    return [...easy, ...medium, ...hard];
  });

  const currentQuestion = questionSequence[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionSequence.length) * 100;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newResponses = [...responses, isCorrect];
    setResponses(newResponses);

    if (currentQuestionIndex < questionSequence.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      onComplete(newResponses);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#151823] to-[#0F1115] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questionSequence.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C9B458] via-[#C27BA0] to-[#6DAEDB]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10"
          >
            {/* Difficulty badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block mb-6"
            >
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  currentQuestion.difficulty === 'easy'
                    ? 'bg-[#6DAEDB]/20 text-[#6DAEDB]'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-[#C27BA0]/20 text-[#C27BA0]'
                    : 'bg-[#C9B458]/20 text-[#C9B458]'
                }`}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </span>
            </motion.div>

            {/* Question */}
            <h2 className="text-3xl font-bold text-white mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full p-5 rounded-xl text-left transition-all border-2 flex items-center gap-4 group ${
                    selectedOption === index
                      ? 'bg-[#C9B458]/20 border-[#C9B458] shadow-lg shadow-[#C9B458]/20'
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {selectedOption === index ? (
                      <CheckCircle2 size={24} className="text-[#C9B458]" />
                    ) : (
                      <Circle size={24} className="text-gray-500 group-hover:text-gray-400" />
                    )}
                  </div>
                  <span className="text-white font-medium flex-1">{option}</span>
                </motion.button>
              ))}
            </div>

            {/* Next button */}
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              size="lg"
              className="w-full bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg py-6 rounded-xl"
            >
              {currentQuestionIndex < questionSequence.length - 1 ? 'Next Question' : 'Finish Evaluation'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
