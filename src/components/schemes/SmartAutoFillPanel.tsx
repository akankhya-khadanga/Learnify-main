import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Zap, Shield, Clock } from 'lucide-react';

export const SmartAutoFillPanel = () => {
  const features = [
    {
      icon: FileText,
      title: 'Document Auto-Fill',
      description: 'We pre-fill forms using your verified profile data',
      color: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'One-Click Apply',
      description: 'Apply to multiple schemes with a single click',
      color: 'text-amber-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Reduce application time by up to 80%',
      color: 'text-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-2 bg-gradient-to-br from-neon/5 via-transparent to-purple/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon to-purple flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Smart Auto-Fill Assistance</CardTitle>
              <CardDescription className="mt-1">
                Let INTELLI-LEARN handle the paperwork while you focus on your goals
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/80 hover:bg-muted/50 transition-colors"
              >
                <feature.icon className={`w-5 h-5 ${feature.color} flex-shrink-0 mt-0.5`} />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>How it works:</strong> We analyze your profile, match you with eligible schemes,
              and automatically fill application forms with your verified documents and information.
            </p>
            <Button
              className="w-full bg-neon hover:bg-neon/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              size="lg"
            >
              Enable Smart Auto-Fill
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
