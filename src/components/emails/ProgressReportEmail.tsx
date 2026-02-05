import React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Heading,
    Hr,
    Row,
    Column,
} from '@react-email/components';

interface ProgressReportEmailProps {
    userName: string;
    period: 'weekly' | 'monthly';
    stats: {
        totalStudyMinutes: number;
        sessionCount: number;
        avgSessionDuration: number;
        xpGained: number;
        habitsCompleted: number;
        currentStreak: number;
        mostProductiveDay: string;
        mostProductiveHour: string;
    };
    activities: Array<{
        type: string;
        duration: number;
    }>;
    achievements: string[];
}

export const ProgressReportEmail: React.FC<ProgressReportEmailProps> = ({
    userName,
    period,
    stats,
    activities,
    achievements
}) => {
    const periodText = period === 'weekly' ? 'This Week' : 'This Month';

    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={h1}>📊 Your {periodText}'s Progress</Heading>
                        <Text style={subtitle}>Hey {userName}, here's how you did!</Text>
                    </Section>

                    {/* Key Stats */}
                    <Section style={statsSection}>
                        <Row>
                            <Column style={statBox}>
                                <Text style={statNumber}>{Math.round(stats.totalStudyMinutes / 60)}h</Text>
                                <Text style={statLabel}>Study Time</Text>
                            </Column>
                            <Column style={statBox}>
                                <Text style={statNumber}>{stats.sessionCount}</Text>
                                <Text style={statLabel}>Sessions</Text>
                            </Column>
                            <Column style={statBox}>
                                <Text style={statNumber}>{stats.habitsCompleted}</Text>
                                <Text style={statLabel}>Habits</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={divider} />

                    {/* Achievements */}
                    {achievements.length > 0 && (
                        <Section style={section}>
                            <Heading style={h2}>🏆 Achievements Unlocked</Heading>
                            {achievements.map((achievement, index) => (
                                <Text key={index} style={achievementText}>
                                    {achievement}
                                </Text>
                            ))}
                        </Section>
                    )}

                    <Hr style={divider} />

                    {/* Activity Breakdown */}
                    <Section style={section}>
                        <Heading style={h2}>📚 Activity Breakdown</Heading>
                        {activities.map((activity, index) => (
                            <Row key={index} style={activityRow}>
                                <Column>
                                    <Text style={activityName}>{activity.type}</Text>
                                </Column>
                                <Column align="right">
                                    <Text style={activityDuration}>{activity.duration} min</Text>
                                </Column>
                            </Row>
                        ))}
                    </Section>

                    <Hr style={divider} />

                    {/* Insights */}
                    <Section style={section}>
                        <Heading style={h2}>💡 Insights</Heading>
                        <Text style={insightText}>
                            <strong>Peak Performance:</strong> You're most productive on{' '}
                            {stats.mostProductiveDay}s at {stats.mostProductiveHour}
                        </Text>
                        <Text style={insightText}>
                            <strong>Average Session:</strong> {stats.avgSessionDuration} minutes
                        </Text>
                        {stats.currentStreak > 0 && (
                            <Text style={insightText}>
                                <strong>Current Streak:</strong> 🔥 {stats.currentStreak} days!
                            </Text>
                        )}
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Keep up the great work! 🚀
                        </Text>
                        <Text style={footerText}>
                            - The Learnify Team
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 24px',
    backgroundColor: '#8b5cf6',
    borderRadius: '8px 8px 0 0',
};

const h1 = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px',
    padding: '0',
};

const subtitle = {
    color: '#e9d5ff',
    fontSize: '16px',
    margin: '0',
};

const h2 = {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 16px',
};

const statsSection = {
    padding: '24px',
};

const statBox = {
    textAlign: 'center' as const,
    padding: '16px',
};

const statNumber = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    margin: '0 0 4px',
};

const statLabel = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
};

const section = {
    padding: '24px',
};

const achievementText = {
    fontSize: '16px',
    color: '#374151',
    margin: '8px 0',
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    borderLeft: '4px solid #f59e0b',
};

const activityRow = {
    marginBottom: '12px',
};

const activityName = {
    fontSize: '16px',
    color: '#374151',
    margin: '0',
};

const activityDuration = {
    fontSize: '16px',
    color: '#8b5cf6',
    fontWeight: 'bold',
    margin: '0',
};

const insightText = {
    fontSize: '14px',
    color: '#4b5563',
    margin: '8px 0',
    lineHeight: '1.6',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '0',
};

const footer = {
    padding: '24px',
    textAlign: 'center' as const,
};

const footerText = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0',
};

export default ProgressReportEmail;
