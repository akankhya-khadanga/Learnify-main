import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scheme, getDaysUntilDeadline } from '@/mocks/schemes';
import { Calendar, ExternalLink, Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface SchemeCardProps {
  scheme: Scheme;
  onCheckEligibility?: (schemeId: string) => void;
  variant?: 'default' | 'compact';
}

export const SchemeCard = ({ scheme, onCheckEligibility, variant = 'default' }: SchemeCardProps) => {
  const daysLeft = getDaysUntilDeadline(scheme.deadline);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SCHOLARSHIP': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'FEE_WAIVER': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'CAREER_PROGRAM': return 'bg-accent-500/10 text-accent-600 border-purple-500/20';
      case 'MERIT_BASED': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'FINANCIAL_AID': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'SKILL_DEVELOPMENT': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getDeadlineColor = () => {
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 30) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="h-full relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2">
        {scheme.isRecommended && (
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Badge
                variant="default"
                className="bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {scheme.matchScore}% Match
              </Badge>
            </motion.div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold leading-tight mb-1.5">
                {scheme.title}
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-1">
                <Award className="w-3 h-3" />
                {scheme.provider}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={`${getCategoryColor(scheme.category)} border`}>
              {scheme.category.replace('_', ' ')}
            </Badge>
            {scheme.stipend && (
              <Badge variant="outline" className="border-neon text-primary">
                {scheme.stipend}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {scheme.description}
          </p>

          {variant === 'default' && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Key Benefits
                </h4>
                <ul className="space-y-1">
                  {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {scheme.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className={`w-4 h-4 ${getDeadlineColor()}`} />
              <span className={`font-medium ${getDeadlineColor()}`}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onCheckEligibility && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCheckEligibility(scheme.id)}
                  className="hover:bg-primary/10 hover:border-neon hover:text-primary"
                >
                  Check Eligibility
                </Button>
              )}
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                asChild
              >
                <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
