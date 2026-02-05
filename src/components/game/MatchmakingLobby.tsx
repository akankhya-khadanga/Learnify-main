import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createMatch, MockPlayer, MatchState } from '@/mocks/multiplayer';
import { Users, Play, Loader2, Crown, Zap } from 'lucide-react';

interface MatchmakingLobbyProps {
  onMatchStart: (match: MatchState) => void;
  onCancel: () => void;
}

export const MatchmakingLobby = ({ onMatchStart, onCancel }: MatchmakingLobbyProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(4);

  const handleQuickMatch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      const match = createMatch(selectedPlayerCount);
      onMatchStart(match);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <CardTitle className="text-3xl text-white mb-2">
            Competition Matchmaking
          </CardTitle>
          <p className="text-gray-400">
            Compete with other players in real-time knowledge battles
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSearching ? (
            <>
              {/* Player Count Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">
                  Match Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map((count) => (
                    <motion.button
                      key={count}
                      onClick={() => setSelectedPlayerCount(count)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPlayerCount === count
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Users className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                        <div className="text-lg font-bold text-white">{count}v{count}</div>
                        <div className="text-xs text-gray-400">Players</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Match Info */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#C9B458]" />
                  Match Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">5 Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-300">Ranked Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">+50 XP Win</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Mixed Difficulty</Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleQuickMatch}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Quick Match
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-700 text-white hover:border-gray-600"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                You'll be matched with players of similar skill level
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-16 h-16 mx-auto text-purple-500" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  Finding Players...
                </h3>
                <p className="text-gray-400">
                  Matching you with {selectedPlayerCount - 1} other player{selectedPlayerCount > 2 ? 's' : ''}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
              >
                Cancel Search
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
