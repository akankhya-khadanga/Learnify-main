import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionPanel } from './QuestionPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MatchState, MockPlayer, simulateAIAnswer, getAIAnswerDelay } from '@/mocks/multiplayer';
import { getRandomQuestions, GameQuestion, ENERGY_CONFIG, calculateEnergyChange } from '@/mocks/game';
import { Zap, Trophy, Users, Clock } from 'lucide-react';

interface MultiplayerMatchProps {
  match: MatchState;
  onMatchComplete: (finalPlayers: MockPlayer[]) => void;
}

export const MultiplayerMatch = ({ match, onMatchComplete }: MultiplayerMatchProps) => {
  const [gameState, setGameState] = useState<'COUNTDOWN' | 'PLAYING' | 'WAITING'>('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);
  const [questions] = useState<GameQuestion[]>(getRandomQuestions(match.settings.questionCount));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [players, setPlayers] = useState<MockPlayer[]>(match.players);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [aiAnswersProcessed, setAiAnswersProcessed] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (gameState === 'COUNTDOWN' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'COUNTDOWN' && countdown === 0) {
      setGameState('PLAYING');
    }
  }, [gameState, countdown]);

  const updatePlayerStats = (playerId: string, isCorrect: boolean) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newEnergy = calculateEnergyChange(p.energy, isCorrect);
        return {
          ...p,
          energy: newEnergy,
          questionsAnswered: p.questionsAnswered + 1,
          correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0)
        };
      }
      return p;
    }));
  };

  const processAIAnswers = useCallback(() => {
    setAiAnswersProcessed(true);
    
    players.forEach((player) => {
      if (player.isAI) {
        const delay = getAIAnswerDelay();
        setTimeout(() => {
          const isCorrect = simulateAIAnswer(player, currentQuestion.difficulty);
          updatePlayerStats(player.id, isCorrect);
        }, delay);
      }
    });

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setHasAnswered(false);
        setAiAnswersProcessed(false);
        setGameState('PLAYING');
      } else {
        onMatchComplete(players);
      }
    }, 3000);
  }, [players, currentQuestion, currentQuestionIndex, questions.length, onMatchComplete]);

  useEffect(() => {
    if (gameState === 'PLAYING' && hasAnswered && !aiAnswersProcessed) {
      processAIAnswers();
    }
  }, [gameState, hasAnswered, aiAnswersProcessed, processAIAnswers]);

  const handlePlayerAnswer = (selectedIndex: number, isCorrect: boolean) => {
    setHasAnswered(true);
    const humanPlayer = players.find(p => !p.isAI);
    if (humanPlayer) {
      updatePlayerStats(humanPlayer.id, isCorrect);
    }
    setGameState('WAITING');
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.energy !== a.energy) return b.energy - a.energy;
    return b.correctAnswers - a.correctAnswers;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {gameState === 'COUNTDOWN' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className="text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                {countdown === 0 ? 'GO!' : countdown}
              </div>
              <p className="text-2xl text-white">Get Ready!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameState !== 'COUNTDOWN' && (
        <>
          {/* Match Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-white">Competition Match</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{players.length} Players</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500">
                      Question {currentQuestionIndex + 1}/{questions.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Match Progress</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / questions.length) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-2">
              <QuestionPanel
                question={currentQuestion}
                onAnswer={handlePlayerAnswer}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
            </div>

            {/* Live Leaderboard */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm sticky top-6">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-5 h-5 text-[#C9B458]" />
                      <h3 className="font-semibold text-white">Live Rankings</h3>
                    </div>

                    <div className="space-y-2">
                      {sortedPlayers.map((player, index) => {
                        const isPlayer = !player.isAI;
                        const rank = index + 1;
                        
                        return (
                          <motion.div
                            key={player.id}
                            layout
                            className={`p-3 rounded-lg border ${
                              isPlayer 
                                ? 'border-[#6DAEDB] bg-[#6DAEDB]/10' 
                                : 'border-gray-700 bg-gray-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                rank === 1 ? 'bg-yellow-400 text-black' :
                                rank === 2 ? 'bg-gray-400 text-black' :
                                rank === 3 ? 'bg-orange-400 text-black' :
                                'bg-gray-700 text-white'
                              }`}>
                                {rank}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-semibold text-white truncate">
                                    {player.username}
                                  </span>
                                  {isPlayer && (
                                    <Badge variant="outline" className="bg-[#6DAEDB]/20 text-[#6DAEDB] border-[#6DAEDB] text-xs px-1">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>{player.correctAnswers} correct</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-[#C9B458]" />
                                  <span className="text-sm font-bold text-[#C9B458]">
                                    {player.energy}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {gameState === 'WAITING' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center pt-4 border-t border-gray-700"
                      >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>Waiting for other players...</span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
