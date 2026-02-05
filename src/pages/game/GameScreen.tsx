import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameHUD } from '@/components/game/GameHUD';
import { QuestionPanel } from '@/components/game/QuestionPanel';
import { MatchmakingLobby } from '@/components/game/MatchmakingLobby';
import { MultiplayerMatch } from '@/components/game/MultiplayerMatch';
import { MatchLeaderboard } from '@/components/game/MatchLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnergyTracker } from '@/hooks/useEnergyTracker';
import { getRandomQuestions, GameQuestion } from '@/mocks/game';
import { MatchState, MockPlayer } from '@/mocks/multiplayer';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Gamepad2
} from 'lucide-react';

type GameMode = 'PRACTICE' | 'COMPETITION';
type GameState = 'MENU' | 'MATCHMAKING' | 'PLAYING' | 'MULTIPLAYER_PLAYING' | 'MULTIPLAYER_COMPLETE' | 'COMPLETED';

const GameScreen = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('PRACTICE');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);
  const [matchResults, setMatchResults] = useState<MockPlayer[]>([]);

  const {
    energy,
    streak,
    bestStreak,
    questionsAnswered,
    correctAnswers,
    answerQuestion,
    resetSession
  } = useEnergyTracker();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'COMPETITION') {
      setGameState('MATCHMAKING');
    } else {
      setQuestions(getRandomQuestions(10));
      setCurrentQuestionIndex(0);
      resetSession();
      setGameState('PLAYING');
      setLastAnswerCorrect(null);
    }
  };

  const handleMatchStart = (match: MatchState) => {
    setCurrentMatch(match);
    setGameState('MULTIPLAYER_PLAYING');
  };

  const handleMatchComplete = (finalPlayers: MockPlayer[]) => {
    setMatchResults(finalPlayers);
    setGameState('MULTIPLAYER_COMPLETE');
  };

  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    answerQuestion(isCorrect);
    setLastAnswerCorrect(isCorrect);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setLastAnswerCorrect(null);
      } else {
        setGameState('COMPLETED');
      }
    }, 2500);
  };

  const restartGame = () => {
    startGame(gameMode);
  };

  const backToMenu = () => {
    setGameState('MENU');
    resetSession();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9B458] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C27BA0] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6DAEDB] rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-[#C9B458]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit Game
            </Button>

            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-[#C9B458]" />
              <h1 className="text-2xl font-bold text-white">Learnify Game Center</h1>
            </div>

            <div className="w-32" /> {/* Spacer for alignment */}
          </motion.div>

          {/* Game States */}
          <AnimatePresence mode="wait">
            {gameState === 'MENU' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-white mb-2">
                      Choose Your Game Mode
                    </CardTitle>
                    <p className="text-gray-400">
                      Test your knowledge and earn energy points!
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Practice Mode */}
                    <motion.button
                      onClick={() => startGame('PRACTICE')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-6 rounded-lg border-2 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Target className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-white">Practice Mode</h3>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                              Available
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">
                            Sharpen your skills with unlimited practice questions. Perfect for learning and improving!
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">Unlimited Questions</Badge>
                            <Badge variant="secondary" className="text-xs">No Time Limit</Badge>
                            <Badge variant="secondary" className="text-xs">Learn at Your Pace</Badge>
                          </div>
                        </div>
                        <Play className="w-8 h-8 text-blue-400" />
                      </div>
                    </motion.button>

                    {/* Competition Mode */}
                    <motion.button
                      onClick={() => startGame('COMPETITION')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-6 rounded-lg border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-6 h-6 text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Competition Mode</h3>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                              Available
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">
                            Compete with other students in real-time battles. Climb the leaderboard and win rewards!
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">Real-time Matches</Badge>
                            <Badge variant="secondary" className="text-xs">Leaderboards</Badge>
                            <Badge variant="secondary" className="text-xs">Special Rewards</Badge>
                          </div>
                        </div>
                        <Play className="w-8 h-8 text-purple-400" />
                      </div>
                    </motion.button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-[#C9B458]/10 to-[#C27BA0]/10 border-[#C9B458]/30">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#C9B458]" />
                      How to Play
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-[#C9B458]">•</span>
                        Start with <strong className="text-[#C9B458]">50 energy points</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        Correct answer: <strong className="text-green-400">+6 energy</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        Wrong answer: <strong className="text-red-400">-2 energy</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400">•</span>
                        Build streaks for bonus multipliers (coming soon!)
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {gameState === 'MATCHMAKING' && (
              <motion.div
                key="matchmaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MatchmakingLobby
                  onMatchStart={handleMatchStart}
                  onCancel={backToMenu}
                />
              </motion.div>
            )}

            {gameState === 'MULTIPLAYER_PLAYING' && currentMatch && (
              <motion.div
                key="multiplayer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MultiplayerMatch
                  match={currentMatch}
                  onMatchComplete={handleMatchComplete}
                />
              </motion.div>
            )}

            {gameState === 'MULTIPLAYER_COMPLETE' && matchResults.length > 0 && (
              <motion.div
                key="multiplayer-complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MatchLeaderboard
                  players={matchResults}
                  onContinue={backToMenu}
                />
              </motion.div>
            )}

            {gameState === 'PLAYING' && currentQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <GameHUD
                  energy={energy}
                  streak={streak}
                  bestStreak={bestStreak}
                  questionsAnswered={questionsAnswered}
                  correctAnswers={correctAnswers}
                  mode={gameMode}
                  lastAnswerCorrect={lastAnswerCorrect}
                />

                <QuestionPanel
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                />

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={backToMenu}
                    className="text-white border-gray-700 hover:border-[#C9B458] hover:text-[#C9B458]"
                  >
                    Exit to Menu
                  </Button>
                </div>
              </motion.div>
            )}

            {gameState === 'COMPLETED' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center"
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                    <CardTitle className="text-3xl text-white mb-2">
                      Game Complete!
                    </CardTitle>
                    <p className="text-gray-400">Great job! Here's how you performed:</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gray-800/50 text-center">
                        <div className="text-3xl font-bold text-[#C9B458] mb-1">{correctAnswers}</div>
                        <div className="text-sm text-gray-400">Correct Answers</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800/50 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                          {Math.round((correctAnswers / questionsAnswered) * 100)}%
                        </div>
                        <div className="text-sm text-gray-400">Accuracy</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800/50 text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-1">{bestStreak}</div>
                        <div className="text-sm text-gray-400">Best Streak</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800/50 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">{energy}</div>
                        <div className="text-sm text-gray-400">Final Energy</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={restartGame}
                        className="flex-1 bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={backToMenu}
                        className="flex-1 border-gray-700 text-white hover:border-[#C9B458] hover:text-[#C9B458]"
                      >
                        Back to Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
