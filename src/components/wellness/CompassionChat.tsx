import { motion } from 'framer-motion';
import { CompassionMessage } from '@/mocks/wellness';
import { Sparkles, User } from 'lucide-react';

interface CompassionChatProps {
  messages: CompassionMessage[];
  onSendMessage?: (message: string) => void;
}

export default function CompassionChat({ messages }: CompassionChatProps) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">Compassion Assistant</h3>
          <p className="text-xs text-gray-400">Here to listen and support you</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.type === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.type === 'USER' ? 'order-2' : 'order-1'
              }`}
            >
              <div
                className={`rounded-2xl p-4 ${
                  message.type === 'USER'
                    ? 'bg-gradient-to-br from-[#6DAEDB]/30 to-[#6DAEDB]/10 border border-[#6DAEDB]/30'
                    : 'bg-gradient-to-br from-[#C9B458]/20 to-[#C27BA0]/10 border border-[#C9B458]/20'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {message.type === 'AI' ? (
                    <Sparkles className="w-4 h-4 text-[#C9B458] mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-[#6DAEDB] mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm text-white leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Placeholder */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
        <p className="text-sm text-gray-400">
          💬 Full chat feature coming soon. For now, reach out to your support network.
        </p>
      </div>
    </div>
  );
}
