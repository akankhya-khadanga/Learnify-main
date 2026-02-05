import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VerifiedAIMessage } from '@/mocks/verifiedSources';
import { Brain, CheckCircle, FileText, AlertCircle } from 'lucide-react';

interface ReasoningDrawerProps {
  message: VerifiedAIMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReasoningDrawer: React.FC<ReasoningDrawerProps> = ({ message, isOpen, onClose }) => {
  if (!message || !message.reasoning) return null;

  const { reasoning, hallucinationCheck } = message;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] overflow-y-auto">
        <SheetHeader className="border-b-4 border-black pb-4 mb-4">
          <SheetTitle className="text-2xl font-black flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#C9B458]" />
            AI Reasoning Process
          </SheetTitle>
          <SheetDescription className="text-base font-bold">
            How this answer was generated
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Confidence Score */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#C27BA0]" />
              Confidence Score
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Overall Confidence</span>
                <span className="text-2xl font-black text-green-600">
                  {reasoning.confidenceScore}%
                </span>
              </div>
              <Progress value={reasoning.confidenceScore} className="h-3 border-2 border-black" />
              <p className="text-xs text-black/60 mt-2">
                Based on source reliability and content alignment
              </p>
            </div>
          </Card>

          {/* Hallucination Check */}
          {hallucinationCheck && (
            <Card className={`border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 ${
              hallucinationCheck.passed 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}>
              <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                {hallucinationCheck.passed ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Hallucination Check Passed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">Potential Issues Detected</span>
                  </>
                )}
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Verification Score</span>
                  <span className={`text-xl font-black ${
                    hallucinationCheck.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {hallucinationCheck.confidence}%
                  </span>
                </div>
                
                {hallucinationCheck.flags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-bold mb-2">Flags:</p>
                    <ul className="space-y-1">
                      {hallucinationCheck.flags.map((flag, index) => (
                        <li key={index} className="text-xs text-black/80 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Sources Consulted */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6DAEDB]" />
              Sources Consulted
            </h3>
            <div className="space-y-2">
              {reasoning.sourcesConsulted.map((sourceId, index) => (
                <Badge 
                  key={index}
                  className="mr-2 mb-2 bg-green-500 text-white border-2 border-black"
                >
                  {sourceId}
                </Badge>
              ))}
              <p className="text-xs text-black/60 mt-2">
                {reasoning.sourcesConsulted.length} verified source{reasoning.sourcesConsulted.length !== 1 ? 's' : ''} referenced
              </p>
            </div>
          </Card>

          {/* Methodology */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <h3 className="text-lg font-black mb-3">Methodology</h3>
            <p className="text-sm leading-relaxed text-black/80">
              {reasoning.methodology}
            </p>
          </Card>

          {/* Info Footer */}
          <div className="bg-[#C9B458]/10 border-2 border-black rounded-lg p-3">
            <p className="text-xs text-black/70">
              <strong>Note:</strong> This reasoning breakdown shows how the AI arrived at its answer using only instructor-verified sources. All information is traceable to approved course materials.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
