import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SchemeCategory, EducationLevel, SCHEME_CATEGORIES } from '@/mocks/schemes';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface SchemeFiltersProps {
  selectedCategory: SchemeCategory | 'ALL';
  selectedEducationLevel: EducationLevel | 'ALL';
  selectedState: string | 'ALL';
  onCategoryChange: (category: SchemeCategory | 'ALL') => void;
  onEducationLevelChange: (level: EducationLevel | 'ALL') => void;
  onStateChange: (state: string | 'ALL') => void;
}

const EDUCATION_LEVELS = [
  { value: 'ALL' as const, label: 'All Levels' },
  { value: 'UNDERGRADUATE' as const, label: 'Undergraduate' },
  { value: 'POSTGRADUATE' as const, label: 'Postgraduate' },
  { value: 'DOCTORATE' as const, label: 'Doctorate' }
];

const STATES = [
  'ALL',
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'Various States'
];

export const SchemeFilters = ({
  selectedCategory,
  selectedEducationLevel,
  selectedState,
  onCategoryChange,
  onEducationLevelChange,
  onStateChange
}: SchemeFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedEducationLevel !== 'ALL' ||
    selectedState !== 'ALL';

  const clearAllFilters = () => {
    onCategoryChange('ALL');
    onEducationLevelChange('ALL');
    onStateChange('ALL');
  };

  return (
    <Card className="mb-6 border-2">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Filters</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {[
                    selectedCategory !== 'ALL',
                    selectedEducationLevel !== 'ALL',
                    selectedState !== 'ALL'
                  ].filter(Boolean).length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 text-xs"
              >
                {isExpanded ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-4 pt-2">
              {/* Category Filters */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${selectedCategory === 'ALL'
                        ? 'bg-neon text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-muted'
                      }`}
                    onClick={() => onCategoryChange('ALL')}
                  >
                    All Categories
                  </Badge>
                  {SCHEME_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategory === cat.value ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${selectedCategory === cat.value
                          ? 'bg-neon text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => onCategoryChange(cat.value)}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Education Level Filters */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Education Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_LEVELS.map((level) => (
                    <Badge
                      key={level.value}
                      variant={selectedEducationLevel === level.value ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${selectedEducationLevel === level.value
                          ? 'bg-purple text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => onEducationLevelChange(level.value)}
                    >
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* State Filters */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  State
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((state) => (
                    <Badge
                      key={state}
                      variant={selectedState === state ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${selectedState === state
                          ? 'bg-purple text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'hover:bg-muted'
                        }`}
                      onClick={() => onStateChange(state)}
                    >
                      {state === 'ALL' ? 'All States' : state}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
