import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Hash, BookOpen, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { studyGroupsService } from '@/services/studyGroupsService';
import { friendsService, type UserProfile } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Other',
];

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [friends, setFriends] = useState<UserProfile[]>([]);

    // Load friends when modal opens
    useEffect(() => {
        if (isOpen) {
            friendsService.getFriends().then(setFriends);
        }
    }, [isOpen]);

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a group name',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsCreating(true);

            // Create group
            const group = await studyGroupsService.createGroup({
                name: groupName.trim(),
                description: description.trim() || undefined,
                subject: subject || undefined,
            });

            // Add selected friends
            for (const friendId of selectedFriends) {
                await studyGroupsService.addMember(group.id, friendId);
            }

            toast({
                title: 'Success!',
                description: `Group "${groupName}" created successfully`,
            });

            // Reset and close
            resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating group:', error);
            toast({
                title: 'Error',
                description: 'Failed to create group',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setGroupName('');
        setDescription('');
        setSubject('');
        setSelectedFriends([]);
    };

    const toggleFriend = (friendId: string) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-br from-[#0F1115] to-[#151823] rounded-2xl border-2 border-neon/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-neon/20 to-purple/20 border-b border-white/10 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon to-purple flex items-center justify-center">
                                    <Hash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Create Study Group</h2>
                                    <p className="text-sm text-gray-400">Step {step} of 3</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="groupName" className="text-white font-semibold">
                                        Group Name *
                                    </Label>
                                    <Input
                                        id="groupName"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="e.g., Calculus Study Group"
                                        className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-white font-semibold">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What's this group about?"
                                        className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[100px]"
                                        maxLength={200}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label className="text-white font-semibold mb-3 block">
                                        <BookOpen className="w-4 h-4 inline mr-2" />
                                        Select Subject (Optional)
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SUBJECTS.map((subj) => (
                                            <button
                                                key={subj}
                                                onClick={() => setSubject(subj === subject ? '' : subj)}
                                                className={`p-3 rounded-lg border-2 transition-all font-semibold ${subject === subj
                                                    ? 'bg-neon text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                {subj}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label className="text-white font-semibold mb-3 block">
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Add Friends ({selectedFriends.length} selected)
                                    </Label>
                                    {friends.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                            <p>No friends yet</p>
                                            <p className="text-sm text-gray-500 mt-1">You can add members later</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {friends.map((friend) => (
                                                <button
                                                    key={friend.id}
                                                    onClick={() => toggleFriend(friend.id)}
                                                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedFriends.includes(friend.id)
                                                        ? 'bg-neon/20 border-neon'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-neon flex items-center justify-center">
                                                        <span className="text-white font-bold">
                                                            {friend.display_name?.[0] || friend.username[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-semibold text-white">
                                                            {friend.display_name || friend.username}
                                                        </p>
                                                        <p className="text-xs text-gray-400">@{friend.username}</p>
                                                    </div>
                                                    {selectedFriends.includes(friend.id) && (
                                                        <div className="w-5 h-5 rounded-full bg-neon flex items-center justify-center">
                                                            <span className="text-black text-xs">✓</span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 p-6 bg-black/20">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                                className="border-white/10 text-white hover:bg-white/10"
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </Button>

                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && !groupName.trim()}
                                    className="bg-neon hover:bg-neon/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating || !groupName.trim()}
                                    className="bg-neon hover:bg-neon/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    {isCreating ? 'Creating...' : 'Create Group'}
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
