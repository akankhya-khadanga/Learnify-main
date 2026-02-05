import { useState, useCallback } from 'react';
import { ENERGY_CONFIG, calculateEnergyChange, GameSession } from '@/mocks/game';

export const useEnergyTracker = (initialEnergy: number = ENERGY_CONFIG.baseEnergy) => {
  const [energy, setEnergy] = useState(initialEnergy);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const answerQuestion = useCallback((isCorrect: boolean) => {
    // Update energy
    const newEnergy = calculateEnergyChange(energy, isCorrect);
    setEnergy(newEnergy);

    // Update stats
    setQuestionsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    return newEnergy;
  }, [energy, bestStreak]);

  const resetSession = useCallback(() => {
    setEnergy(ENERGY_CONFIG.baseEnergy);
    setStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
  }, []);

  const getStats = useCallback((): Partial<GameSession> => {
    return {
      currentEnergy: energy,
      questionsAnswered,
      correctAnswers,
      currentStreak: streak,
      bestStreak
    };
  }, [energy, questionsAnswered, correctAnswers, streak, bestStreak]);

  return {
    energy,
    streak,
    bestStreak,
    questionsAnswered,
    correctAnswers,
    answerQuestion,
    resetSession,
    getStats
  };
};
