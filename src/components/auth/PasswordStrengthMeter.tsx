import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
    password: string;
    className?: string;
}

interface StrengthCriteria {
    label: string;
    test: (password: string) => boolean;
}

const STRENGTH_CRITERIA: StrengthCriteria[] = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
    { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
    const metCriteria = STRENGTH_CRITERIA.filter(criteria => criteria.test(password));
    const strength = metCriteria.length;

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-gray-600';
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (strength === 0) return '';
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Fair';
        if (strength <= 4) return 'Good';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Strength Bar */}
            <div className="space-y-2">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: i < strength ? 1 : 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className={`h-2 flex-1 rounded-full ${i < strength ? getStrengthColor() : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
                {getStrengthLabel() && (
                    <p className={`text-sm font-bold ${strength <= 2 ? 'text-red-500' :
                            strength <= 3 ? 'text-yellow-500' :
                                strength <= 4 ? 'text-blue-500' :
                                    'text-green-500'
                        }`}>
                        Password Strength: {getStrengthLabel()}
                    </p>
                )}
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-1">
                {STRENGTH_CRITERIA.map((criteria, index) => {
                    const isMet = criteria.test(password);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2 text-xs"
                        >
                            {isMet ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <X className="w-4 h-4 text-gray-600" />
                            )}
                            <span className={`font-bold ${isMet ? 'text-green-500' : 'text-gray-600'}`}>
                                {criteria.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
