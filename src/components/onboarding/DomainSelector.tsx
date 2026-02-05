import { motion } from 'framer-motion';
import { domains, Domain } from '@/mocks/onboarding';

interface DomainSelectorProps {
  onSelect: (domain: Domain) => void;
}

export default function DomainSelector({ onSelect }: DomainSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#151823] to-[#0F1115] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#C9B458] via-[#C27BA0] to-[#6DAEDB] bg-clip-text text-transparent">
            Choose Your Domain
          </h1>
          <p className="text-gray-400 text-lg">
            Select the field you want to focus on during your learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, index) => (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(domain)}
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
            >
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${domain.color}33, transparent)`
                }}
              />

              <div className="relative z-10">
                <div className="text-6xl mb-4">{domain.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {domain.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {domain.description}
                </p>
              </div>

              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-30 blur-2xl"
                style={{ backgroundColor: domain.color }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
