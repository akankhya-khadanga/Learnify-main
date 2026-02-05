import React from 'react';
import { motion } from 'framer-motion';
import { ContentStyle, STYLE_PRESETS, StylePreset } from '@/mocks/adaptiveContent';
import { Video, Smile, Users, FileText, Award } from 'lucide-react';

interface StylePresetSelectorProps {
  selectedStyle: ContentStyle;
  onStyleChange: (style: ContentStyle) => void;
}

export const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({
  selectedStyle,
  onStyleChange,
}) => {
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Video: <Video className="w-5 h-5" />,
      Laugh: <Smile className="w-5 h-5" />,
      Users: <Users className="w-5 h-5" />,
      FileText: <FileText className="w-5 h-5" />,
      Award: <Award className="w-5 h-5" />,
    };
    return icons[iconName] || <FileText className="w-5 h-5" />;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black text-white uppercase">Content Style</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STYLE_PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            onClick={() => onStyleChange(preset.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 border-4 border-black transition-all ${
              selectedStyle === preset.id
                ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                : 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
            style={{
              backgroundColor: selectedStyle === preset.id ? preset.color : '#151823',
            }}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl">{preset.emoji}</div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-black ${
                  selectedStyle === preset.id ? 'bg-black/30' : 'bg-black/50'
                }`}
              >
                <div style={{ color: selectedStyle === preset.id ? 'black' : preset.color }}>
                  {getIcon(preset.icon)}
                </div>
              </div>
              <h4
                className={`font-black text-xs ${
                  selectedStyle === preset.id ? 'text-black' : 'text-white'
                }`}
              >
                {preset.label}
              </h4>
              <p
                className={`text-xs ${
                  selectedStyle === preset.id ? 'text-black/70' : 'text-white/60'
                }`}
              >
                {preset.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
