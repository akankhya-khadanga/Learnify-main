import React from 'react';
import { Button } from '@/components/ui/button';
import {
    MousePointer,
    Highlighter,
    Pen,
    Type,
    Eraser,
    Undo,
    Trash2
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type AnnotationTool = 'select' | 'highlight' | 'draw' | 'text' | 'eraser';

interface AnnotationToolbarProps {
    activeTool: AnnotationTool;
    selectedColor: string;
    onToolChange: (tool: AnnotationTool) => void;
    onColorChange: (color: string) => void;
    onUndo: () => void;
    onClear: () => void;
}

const COLORS = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#800080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Black', value: '#000000' }
];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
    activeTool,
    selectedColor,
    onToolChange,
    onColorChange,
    onUndo,
    onClear
}) => {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                {/* Tool Selection */}
                <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === 'select' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onToolChange('select')}
                            >
                                <MousePointer className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Select Tool</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === 'highlight' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onToolChange('highlight')}
                            >
                                <Highlighter className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Highlight Text</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === 'draw' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onToolChange('draw')}
                            >
                                <Pen className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Draw</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === 'text' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onToolChange('text')}
                            >
                                <Type className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add Text</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === 'eraser' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onToolChange('eraser')}
                            >
                                <Eraser className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eraser</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-1 border-r border-gray-600 pr-2">
                    {COLORS.map(color => (
                        <Tooltip key={color.value}>
                            <TooltipTrigger asChild>
                                <button
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color.value
                                            ? 'border-white scale-110'
                                            : 'border-gray-500 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => onColorChange(color.value)}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{color.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={onUndo}>
                                <Undo className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Undo</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={onClear}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clear Page</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};
