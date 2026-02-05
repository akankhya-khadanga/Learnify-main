import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize2,
  PenTool,
} from 'lucide-react';
import { MOCK_VR_ROOMS, type VRRoom } from '@/mocks/vrCollaborators';

interface RoomSidebarProps {
  selectedRoom: VRRoom;
  onRoomChange: (room: VRRoom) => void;
}

export function RoomSidebar({ selectedRoom, onRoomChange }: RoomSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isCollapsed ? -250 : 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed left-0 top-20 bottom-0 z-40 flex"
    >
      {/* Sidebar Content */}
      <Card className="w-[300px] h-full rounded-none rounded-r-lg border border-slate-200 dark:border-slate-700 shadow-blue-brutal bg-white dark:bg-slate-800 overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b-4 border-black bg-gradient-to-br from-blue/20 to-transparent">
          <CardTitle className="text-xl font-black uppercase text-blue flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            <TranslatedText text="VR Rooms" />
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-3 space-y-2">
            {MOCK_VR_ROOMS.map((room) => {
              const isSelected = room.id === selectedRoom.id;
              const isFull = room.whiteboardsActive >= room.maxWhiteboards;

              return (
                <motion.button
                  key={room.id}
                  onClick={() => onRoomChange(room)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-lg border-4 border-black transition-all ${
                    isSelected
                      ? 'bg-blue shadow-blue-brutal'
                      : 'bg-darknavy hover:bg-darknavy/80 shadow-subtle-brutal'
                  }`}
                  aria-label={`Select ${room.name}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`font-black text-sm uppercase ${
                        isSelected ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {room.name}
                    </h3>
                    {isFull && (
                      <Badge
                        variant="destructive"
                        className="text-xs font-bold uppercase"
                      >
                        Full
                      </Badge>
                    )}
                  </div>

                  <p
                    className={`text-xs mb-3 ${
                      isSelected ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {room.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-accent" />
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {room.usersOnline}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <PenTool className="h-3 w-3 text-primary" />
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {room.whiteboardsActive}/{room.maxWhiteboards}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="mt-3 h-1 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </CardContent>
        </ScrollArea>

        {/* Current Room Info */}
        <div className="p-3 border-t-4 border-black bg-gradient-to-br from-blue/10 to-transparent">
          <div className="text-xs text-gray-400 mb-1 uppercase font-bold">
            <TranslatedText text="Current Room" />
          </div>
          <div className="text-sm font-black text-white uppercase">
            {selectedRoom.name}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-bold">
              <TranslatedText text="Connected" />
            </span>
          </div>
        </div>
      </Card>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="outline"
        size="icon"
        className="h-12 w-8 rounded-l-none rounded-r-lg border-4 border-black shadow-blue-brutal bg-blue hover:bg-blue/90 self-center"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isCollapsed ? 'expand' : 'collapse'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-white" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-white" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
