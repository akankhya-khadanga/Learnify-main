import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Code, Brain, Database, Palette, Rocket, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface WorkspaceTemplate {
    id: string;
    name: string;
    description: string;
    type: string;
    defaultTools: string[];
    layoutMode: 'grid' | 'split' | 'freeform';
    icon: React.ElementType;
    color: string;
    isCustom: boolean;
}

const PREDEFINED_TEMPLATES: WorkspaceTemplate[] = [
    {
        id: 'frontend-dev',
        name: 'Frontend Development',
        description: 'Perfect for web development with code editor, browser preview, and AI assistant',
        type: 'development',
        defaultTools: ['code-editor', 'ai-tutor', 'roadmap', 'notes'],
        layoutMode: 'grid',
        icon: Code,
        color: '#FFD700',
        isCustom: false,
    },
    {
        id: 'ml-research',
        name: 'Machine Learning',
        description: 'ML workspace with Jupyter notebooks, data visualization, and research tools',
        type: 'research',
        defaultTools: ['ai-tutor', 'notes', 'roadmap'],
        layoutMode: 'split',
        icon: Brain,
        color: '#FF1493',
        isCustom: false,
    },
    {
        id: 'backend-dev',
        name: 'Backend Development',
        description: 'Backend workspace with API testing, database tools, and documentation',
        type: 'development',
        defaultTools: ['code-editor', 'ai-tutor', 'notes'],
        layoutMode: 'grid',
        icon: Database,
        color: '#6DAEDB',
        isCustom: false,
    },
    {
        id: 'design-creative',
        name: 'Design & Creative',
        description: 'Creative workspace for UI/UX design, prototyping, and collaboration',
        type: 'design',
        defaultTools: ['ai-tutor', 'notes', 'roadmap'],
        layoutMode: 'freeform',
        icon: Palette,
        color: '#FF6B6B',
        isCustom: false,
    },
    {
        id: 'study-general',
        name: 'General Study',
        description: 'All-purpose study workspace with notes, AI tutor, and learning roadmap',
        type: 'study',
        defaultTools: ['ai-tutor', 'notes', 'roadmap', 'flashcards'],
        layoutMode: 'grid',
        icon: Sparkles,
        color: '#FFD700',
        isCustom: false,
    },
    {
        id: 'project-management',
        name: 'Project Management',
        description: 'Manage projects with task boards, timelines, and team collaboration',
        type: 'productivity',
        defaultTools: ['notes', 'ai-tutor'],
        layoutMode: 'split',
        icon: Rocket,
        color: '#FF1493',
        isCustom: false,
    },
];

interface WorkspaceTemplatesProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: WorkspaceTemplate) => void;
}

export const WorkspaceTemplates: React.FC<WorkspaceTemplatesProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
}) => {
    const handleSelectTemplate = (template: WorkspaceTemplate) => {
        onSelectTemplate(template);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <DialogHeader className="border-b-4 border-black pb-4">
                    <DialogTitle className="text-2xl font-black flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Workspace Templates
                    </DialogTitle>
                    <DialogDescription className="text-base font-bold">
                        Choose a pre-configured workspace to get started quickly
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PREDEFINED_TEMPLATES.map((template, index) => {
                            const Icon = template.icon;
                            return (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer p-4"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-12 h-12 rounded border-2 border-black flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: template.color }}
                                            >
                                                <Icon className="w-6 h-6 text-black" />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-black text-lg mb-1">{template.name}</h3>
                                                <p className="text-sm text-black/70 mb-3">{template.description}</p>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <Badge variant="outline" className="border-black text-xs">
                                                        {template.layoutMode}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-black text-xs">
                                                        {template.defaultTools.length} tools
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {template.defaultTools.map((tool, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1 text-xs bg-black/5 px-2 py-1 rounded border border-black/20"
                                                        >
                                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                                            <span>{tool}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t-4 border-black pt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
