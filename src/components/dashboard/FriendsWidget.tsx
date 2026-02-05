import { useState, useEffect } from 'react';
import { friendsService, Friend } from '@/services/friendsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FriendsWidget() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [topStreakFriends, setTopStreakFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                // Fetch online friend count
                const count = await friendsService.getOnlineFriendCount();
                setOnlineCount(count);

                // Fetch top 3 friends by streak
                const friends = await friendsService.getTopStreakFriends(3);
                setTopStreakFriends(friends);
            } catch (error) {
                console.error('Error fetching friends data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchFriendsData, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleSendEncouragement = async (friendId: string) => {
        try {
            await friendsService.sendEncouragement(friendId, 'fire');
            // Could show a toast notification here
            console.log('Encouragement sent!');
        } catch (error) {
            console.error('Error sending encouragement:', error);
        }
    };

    if (loading) {
        return (
            <Card className="border border-white/10 bg-[#161B22]/80 backdrop-blur-sm rounded-2xl">
                <div className="p-6 animate-pulse">
                    <div className="h-5 bg-white/10 rounded w-24 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-14 bg-white/10 rounded-xl"></div>
                        <div className="h-14 bg-white/10 rounded-xl"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border border-white/10 bg-[#161B22]/80 backdrop-blur-sm rounded-2xl">
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-purple flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Friends
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            {onlineCount} online
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-sm text-purple hover:bg-purple/20 font-semibold"
                        onClick={() => navigate('/friends')}
                    >
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                {/* Top Streaks */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Friend Streaks
                    </p>
                    {topStreakFriends.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No friends yet. Add some to see their streaks!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {topStreakFriends.map((friend, index) => (
                                <div
                                    key={friend.id}
                                    className="bg-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-muted-foreground w-4">
                                                {index + 1}
                                            </span>
                                            {friend.avatar ? (
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.name}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-purple/20 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple">
                                                        {friend.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {friend.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm font-bold text-orange-500">
                                                {friend.streak}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple/20"
                                            onClick={() => handleSendEncouragement(friend.id)}
                                            title="Send encouragement"
                                        >
                                            🔥
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Study Together CTA */}
                <Button
                    className="w-full bg-purple hover:bg-purple/90 text-white font-bold text-base h-12"
                    onClick={() => navigate('/focus-room')}
                >
                    📚 Study Together
                </Button>
            </div>
        </Card>
    );
}
