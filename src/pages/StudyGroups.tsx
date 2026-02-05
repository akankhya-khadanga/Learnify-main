import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    MessageCircle,
    Users,
    UserPlus,
    Search,
    Plus,
    ArrowLeft,
    Hash,
    Bell,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { studyGroupsService, type StudyGroup } from '@/services/studyGroupsService';
import { messagingService } from '@/services/messagingService';
import { friendsService, type UserProfile } from '@/services/friendsService';
import GroupChat from '@/components/studyGroups/GroupChat';
import CreateGroupModal from '@/components/studyGroups/CreateGroupModal';
import AddFriendsModal from '@/components/studyGroups/AddFriendsModal';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from '@/components/NotificationCenter';

export default function StudyGroups() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false);

    // Load groups and friends
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Load groups
            let groupsData: StudyGroup[] = [];
            try {
                groupsData = await studyGroupsService.getMyGroups();
                setGroups(groupsData);
            } catch (error) {
                console.error('Error loading groups:', error);
            }

            // Load friends (optional - don't fail if this errors)
            try {
                const friendsData = await friendsService.getFriends();
                setFriends(friendsData);
            } catch (error) {
                console.error('Error loading friends:', error);
                setFriends([]); // Set empty array if friends fail to load
            }

            // Load unread counts for each group
            const counts: Record<string, number> = {};
            for (const group of groupsData) {
                try {
                    const count = await messagingService.getUnreadCount(group.id);
                    counts[group.id] = count;
                } catch (error) {
                    console.error(`Error loading unread count for group ${group.id}:`, error);
                    counts[group.id] = 0;
                }
            }
            setUnreadCounts(counts);

        } catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: 'Error loading groups',
                description: 'Failed to load study groups. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle DM parameter from URL (when navigating from Friends page)
    useEffect(() => {
        const dmGroupId = searchParams.get('dm');
        if (dmGroupId && groups.length > 0) {
            const dmGroup = groups.find(g => g.id === dmGroupId);
            if (dmGroup) {
                setSelectedGroup(dmGroup);
            }
        }
    }, [searchParams, groups]);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Separate DMs from regular groups
    const directMessages = filteredGroups.filter(g => g.max_members === 2);
    const regularGroups = filteredGroups.filter(g => g.max_members !== 2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.button
                                onClick={() => navigate('/dashboard')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </motion.button>
                            <div>
                                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                    <MessageCircle className="w-8 h-8 text-primary" />
                                    Study Groups
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    Connect and study with friends
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <NotificationCenter />
                            <Button
                                onClick={() => setIsAddFriendsModalOpen(true)}
                                size="sm"
                                className="bg-accent hover:bg-accent/90 text-white font-bold"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friends
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Sidebar - Groups List */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        {/* Search and Create */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search groups..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white/5 border-slate-200 dark:border-slate-700 text-white placeholder:text-gray-400"
                                />
                            </div>
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Group
                            </Button>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="messages" className="flex-1 flex flex-col">
                            <TabsList className="bg-white/5 border-b border-slate-200 dark:border-slate-700 rounded-none p-1">
                                <TabsTrigger
                                    value="messages"
                                    className="data-[state=active]:bg-pink data-[state=active]:text-white font-semibold flex-1"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Messages ({directMessages.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="groups"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-black font-semibold flex-1"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Groups ({regularGroups.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="friends"
                                    className="data-[state=active]:bg-accent data-[state=active]:text-white font-semibold flex-1"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Friends
                                </TabsTrigger>
                            </TabsList>

                            {/* Direct Messages Tab */}
                            <TabsContent value="messages" className="flex-1 overflow-y-auto p-2 mt-0">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-400">Loading messages...</div>
                                    </div>
                                ) : directMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <MessageCircle className="w-12 h-12 text-gray-600 mb-3" />
                                        <p className="text-gray-400 mb-2">No direct messages yet</p>
                                        <p className="text-sm text-gray-500">Message a friend to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {directMessages.map((dm) => (
                                            <motion.button
                                                key={dm.id}
                                                onClick={() => setSelectedGroup(dm)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full p-3 rounded-lg text-left transition-all ${selectedGroup?.id === dm.id
                                                    ? 'bg-pink/20 border-2 border-pink'
                                                    : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink to-accent flex items-center justify-center flex-shrink-0">
                                                        <MessageCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-bold text-white truncate">
                                                                {dm.name}
                                                            </h3>
                                                            {unreadCounts[dm.id] > 0 && (
                                                                <span className="bg-pink text-white text-xs font-black px-2 py-0.5 rounded-full">
                                                                    {unreadCounts[dm.id]}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 truncate">Direct Message</p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Groups Tab */}

                            <TabsContent value="groups" className="flex-1 overflow-y-auto p-2 mt-0">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-400">Loading groups...</div>
                                    </div>
                                ) : regularGroups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <Hash className="w-12 h-12 text-gray-600 mb-3" />
                                        <p className="text-gray-400 mb-2">No groups yet</p>
                                        <p className="text-sm text-gray-500">Create a group to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {regularGroups.map((group) => (
                                            <motion.button
                                                key={group.id}
                                                onClick={() => setSelectedGroup(group)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full p-3 rounded-lg text-left transition-all ${selectedGroup?.id === group.id
                                                    ? 'bg-primary/20 border-2 border-neon'
                                                    : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                                        <Hash className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-bold text-white truncate">{group.name}</h3>
                                                            {unreadCounts[group.id] > 0 && (
                                                                <span className="bg-primary text-black text-xs font-black px-2 py-0.5 rounded-full">
                                                                    {unreadCounts[group.id]}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {group.subject && (
                                                            <p className="text-xs text-gray-400 truncate">{group.subject}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="friends" className="flex-1 overflow-y-auto p-2 mt-0">
                                {/* Online Friends Counter */}
                                <div className="p-3 mb-3 bg-primary/10 border border-neon/30 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="font-bold text-white">
                                                {friends.filter(f => f.status === 'online').length} of {friends.length} friends online
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => setIsAddFriendsModalOpen(true)}
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90 text-black font-bold h-7 px-3"
                                        >
                                            <UserPlus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {friends.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <UserPlus className="w-12 h-12 text-gray-600 mb-3" />
                                        <p className="text-gray-400 mb-2">No friends yet</p>
                                        <p className="text-sm text-gray-500">Add friends to create groups</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.id}
                                                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                                                        <span className="text-white font-bold">
                                                            {friend.display_name?.[0] || friend.username[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-white truncate">
                                                            {friend.display_name || friend.username}
                                                        </h4>
                                                        <p className="text-xs text-gray-400">@{friend.username}</p>
                                                    </div>
                                                    {friend.status === 'online' && (
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Main Chat Area */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {selectedGroup ? (
                                <GroupChat
                                    key={selectedGroup.id}
                                    group={selectedGroup}
                                    onClose={() => setSelectedGroup(null)}
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                                >
                                    <div className="text-center p-8">
                                        <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Select a group to start chatting
                                        </h3>
                                        <p className="text-gray-400">
                                            Choose a group from the sidebar or create a new one
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadData}
            />

            {/* Add Friends Modal */}
            <AddFriendsModal
                isOpen={isAddFriendsModalOpen}
                onClose={() => setIsAddFriendsModalOpen(false)}
            />
        </div>
    );
}
