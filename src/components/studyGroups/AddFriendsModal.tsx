import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Check, X, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { friendsService, type UserProfile, type Friendship } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';

interface AddFriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddFriendsModal({ isOpen, onClose }: AddFriendsModalProps) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'requests'>('search');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setIsSearching(true);
            const results = await friendsService.searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
            toast({
                title: 'Error',
                description: 'Failed to search users',
                variant: 'destructive',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const loadPendingRequests = async () => {
        try {
            console.log('Loading pending requests...');
            const requests = await friendsService.getPendingRequests();
            console.log('Loaded requests:', requests);
            setPendingRequests(requests);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await friendsService.sendFriendRequest(userId);
            toast({
                title: 'Success',
                description: 'Friend request sent!',
            });
            // Remove from search results
            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error sending request:', error);
            toast({
                title: 'Error',
                description: 'Failed to send friend request',
                variant: 'destructive',
            });
        }
    };

    const handleAcceptRequest = async (friendshipId: string) => {
        try {
            await friendsService.acceptFriendRequest(friendshipId);
            toast({
                title: 'Success',
                description: 'Friend request accepted!',
            });
            loadPendingRequests();
        } catch (error) {
            console.error('Error accepting request:', error);
            toast({
                title: 'Error',
                description: 'Failed to accept request',
                variant: 'destructive',
            });
        }
    };

    const handleRejectRequest = async (friendshipId: string) => {
        try {
            await friendsService.rejectFriendRequest(friendshipId);
            toast({
                title: 'Request rejected',
            });
            loadPendingRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    // Load pending requests when modal opens or tab changes to requests
    useEffect(() => {
        if (isOpen && activeTab === 'requests') {
            loadPendingRequests();
        }
    }, [isOpen, activeTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#0F1115] to-[#151823] rounded-2xl border-2 border-neon/30 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-neon/20 to-purple/20 border-b border-white/10 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white">Add Friends</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'search'
                                ? 'bg-neon text-black'
                                : 'bg-white/5 text-white hover:bg-white/10'
                                }`}
                        >
                            Search Users
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('requests');
                                loadPendingRequests();
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'requests'
                                ? 'bg-purple text-white'
                                : 'bg-white/5 text-white hover:bg-white/10'
                                }`}
                        >
                            Requests ({pendingRequests.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                    {activeTab === 'search' ? (
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by username or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="bg-neon hover:bg-neon/90 text-black font-black"
                                >
                                    Search
                                </Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-neon flex items-center justify-center">
                                                    <span className="text-white font-bold">
                                                        {user.display_name?.[0] || user.username[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">
                                                        {user.display_name || user.username}
                                                    </p>
                                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleSendRequest(user.id)}
                                                size="sm"
                                                className="bg-neon hover:bg-neon/90 text-black font-bold"
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Add Friend
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery && !isSearching ? (
                                <div className="text-center py-8 text-gray-400">
                                    No users found
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pendingRequests.length > 0 ? (
                                pendingRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-neon flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {request.friend?.display_name?.[0] || request.friend?.username[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {request.friend?.display_name || request.friend?.username}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    @{request.friend?.username}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                size="sm"
                                                className="bg-neon hover:bg-neon/90 text-black font-bold"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleRejectRequest(request.id)}
                                                size="sm"
                                                variant="outline"
                                                className="border-white/10 text-white hover:bg-white/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No pending requests
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
