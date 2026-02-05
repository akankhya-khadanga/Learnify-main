import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEligibilityCheck, getSchemeById } from '@/mocks/schemes';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface EligibilityPanelProps {
  schemeId: string | null;
  onClose: () => void;
}

export const EligibilityPanel = ({ schemeId, onClose }: EligibilityPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const eligibilityData = schemeId ? getEligibilityCheck(schemeId) : null;
  const scheme = schemeId ? getSchemeById(schemeId) : null;

  if (!eligibilityData || !scheme) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MEETS':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'DOES_NOT_MEET':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PARTIAL':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getOverallColor = () => {
    switch (eligibilityData.overallEligibility) {
      case 'ELIGIBLE':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'NOT_ELIGIBLE':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'PARTIALLY_ELIGIBLE':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700';
    }
  };

  return (
    <AnimatePresence>
      {schemeId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Card className="border-2 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-purple/10 to-[#6DAEDB]/10 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Eligibility Check</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium">
                    {scheme.title}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <div className={`mt-4 p-3 rounded-lg border-2 ${getOverallColor()}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(eligibilityData.overallEligibility === 'ELIGIBLE' ? 'MEETS' :
                      eligibilityData.overallEligibility === 'NOT_ELIGIBLE' ? 'DOES_NOT_MEET' : 'PARTIAL')}
                    <span className="font-semibold text-sm">
                      {eligibilityData.overallEligibility === 'ELIGIBLE' && 'You are Eligible! 🎉'}
                      {eligibilityData.overallEligibility === 'NOT_ELIGIBLE' && 'Not Eligible Currently'}
                      {eligibilityData.overallEligibility === 'PARTIALLY_ELIGIBLE' && 'Partially Eligible'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-auto p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Eligibility Criteria
                      </h4>
                      <div className="space-y-3">
                        {eligibilityData.criteria.map((criterion, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getStatusIcon(criterion.userStatus)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{criterion.requirement}</p>
                              <p className="text-xs text-muted-foreground">{criterion.details}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Recommended Actions
                      </h4>
                      <div className="space-y-2">
                        {eligibilityData.recommendedActions.map((action, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <Badge variant="outline" className="mt-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                              {idx + 1}
                            </Badge>
                            <p className="text-sm text-muted-foreground flex-1">{action}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {eligibilityData.overallEligibility === 'ELIGIBLE' && (
                      <div className="pt-4 border-t">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          size="lg"
                        >
                          Proceed with Smart Auto-Fill
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
