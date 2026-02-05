import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DomainSelector from '@/components/onboarding/DomainSelector';
import EvaluationInstructions from '@/components/onboarding/EvaluationInstructions';
import AdaptiveMCQTest from '@/components/onboarding/AdaptiveMCQTest';
import ProcessingScreen from '@/components/onboarding/ProcessingScreen';
import TeacherAssignment from '@/components/onboarding/TeacherAssignment';
import { Domain, evaluateIQ, getTeachersForIQTier, Teacher } from '@/mocks/onboarding';

type OnboardingStep = 'domain' | 'instructions' | 'test' | 'processing' | 'assignment';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('domain');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [iqTier, setIqTier] = useState<'low' | 'medium' | 'high' | null>(null);
  const [assignedTeacher, setAssignedTeacher] = useState<Teacher | null>(null);

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(domain);
    setCurrentStep('instructions');
  };

  const handleStartTest = () => {
    setCurrentStep('test');
  };

  const handleTestComplete = (responses: boolean[]) => {
    setCurrentStep('processing');
    const tier = evaluateIQ(responses);
    setIqTier(tier);
    
    // Select a random teacher from the tier
    const teachers = getTeachersForIQTier(tier);
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
    setAssignedTeacher(randomTeacher);
  };

  const handleProcessingComplete = () => {
    setCurrentStep('assignment');
  };

  const handleAcceptTeacher = () => {
    // Store onboarding data in localStorage (mock)
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('selectedDomain', JSON.stringify(selectedDomain));
    localStorage.setItem('iqTier', iqTier || 'medium');
    localStorage.setItem('assignedTeacher', JSON.stringify(assignedTeacher));
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentStep === 'domain' && (
          <motion.div
            key="domain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DomainSelector onSelect={handleDomainSelect} />
          </motion.div>
        )}

        {currentStep === 'instructions' && selectedDomain && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EvaluationInstructions domain={selectedDomain} onStart={handleStartTest} />
          </motion.div>
        )}

        {currentStep === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdaptiveMCQTest onComplete={handleTestComplete} />
          </motion.div>
        )}

        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProcessingScreen onComplete={handleProcessingComplete} />
          </motion.div>
        )}

        {currentStep === 'assignment' && iqTier && assignedTeacher && (
          <motion.div
            key="assignment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TeacherAssignment
              teacher={assignedTeacher}
              iqTier={iqTier}
              onAccept={handleAcceptTeacher}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
