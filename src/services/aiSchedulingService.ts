import { queryAI } from '@/lib/aiClient';
import { studyTaskService, examService, dailyScheduleService, type StudyTask, type Exam, type DailySchedule } from './studyPlannerService';

interface ScheduleGenerationOptions {
    startDate: string;
    endDate: string;
    dailyStudyHours?: number;
    preferredTimeSlots?: string[];
    breakDuration?: number;
}

interface TaskAllocation {
    task_id: string;
    task: StudyTask;
    allocated_hours: number;
    time_slot?: string;
    priority_score: number;
}

interface DaySchedule {
    date: string;
    total_hours: number;
    allocations: TaskAllocation[];
    workload_intensity: 'light' | 'moderate' | 'heavy' | 'extreme';
}

export class AISchedulingService {
    private readonly DEFAULT_DAILY_HOURS = 4;
    private readonly MAX_DAILY_HOURS = 8;
    private readonly BREAK_DURATION = 0.25; // 15 minutes

    /**
     * Generate AI-powered study schedule
     */
    async generateSchedule(options: ScheduleGenerationOptions): Promise<DaySchedule[]> {
        const { startDate, endDate, dailyStudyHours = this.DEFAULT_DAILY_HOURS } = options;

        // Get all pending tasks and upcoming exams
        const tasks = await studyTaskService.getAll();
        const exams = await examService.getUpcoming(90);

        const pendingTasks = tasks.filter(t => t.status === 'pending' && t.deadline);

        if (pendingTasks.length === 0) {
            return [];
        }

        // Calculate priority scores for each task
        const tasksWithPriority = this.calculatePriorityScores(pendingTasks, exams);

        // Generate day-by-day schedule
        const schedule = this.distributeTasksAcrossDays(
            tasksWithPriority,
            startDate,
            endDate,
            dailyStudyHours
        );

        // Save schedules to database
        await this.saveSchedules(schedule);

        return schedule;
    }

    /**
     * Calculate priority scores based on deadline, importance, and related exams
     */
    private calculatePriorityScores(tasks: StudyTask[], exams: Exam[]): TaskAllocation[] {
        const now = new Date();

        return tasks.map(task => {
            let score = 0;

            // Base priority score
            const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
            score += priorityScores[task.priority] * 10;

            // Deadline urgency (closer deadline = higher score)
            if (task.deadline) {
                const daysUntilDeadline = Math.max(
                    0,
                    Math.ceil((new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                );

                if (daysUntilDeadline <= 1) score += 50;
                else if (daysUntilDeadline <= 3) score += 30;
                else if (daysUntilDeadline <= 7) score += 20;
                else if (daysUntilDeadline <= 14) score += 10;
                else score += 5;
            }

            // Related exam boost
            const relatedExam = exams.find(e =>
                e.subject?.toLowerCase() === task.subject?.toLowerCase()
            );

            if (relatedExam) {
                const daysUntilExam = Math.ceil(
                    (new Date(relatedExam.exam_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysUntilExam <= 7) score += 25;
                else if (daysUntilExam <= 14) score += 15;
                else if (daysUntilExam <= 30) score += 10;
            }

            return {
                task_id: task.id,
                task,
                allocated_hours: 0,
                priority_score: score,
            };
        });
    }

    /**
     * Distribute tasks across days using workload balancing
     */
    private distributeTasksAcrossDays(
        tasks: TaskAllocation[],
        startDate: string,
        endDate: string,
        dailyHours: number
    ): DaySchedule[] {
        const schedule: DaySchedule[] = [];
        const sortedTasks = [...tasks].sort((a, b) => b.priority_score - a.priority_score);

        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        // Track remaining hours for each task
        const remainingHours = new Map(
            sortedTasks.map(t => [t.task_id, t.task.estimated_hours || 2])
        );

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAllocations: TaskAllocation[] = [];
            let totalHours = 0;

            // Allocate tasks for this day
            for (const taskAlloc of sortedTasks) {
                const remaining = remainingHours.get(taskAlloc.task_id) || 0;

                if (remaining <= 0) continue;
                if (totalHours >= dailyHours) break;

                // Check if task deadline is before or on this day
                const taskDeadline = taskAlloc.task.deadline ? new Date(taskAlloc.task.deadline) : null;
                if (taskDeadline && taskDeadline < currentDate) continue;

                // Allocate hours for this task
                const availableHours = dailyHours - totalHours;
                const hoursToAllocate = Math.min(remaining, availableHours, 3); // Max 3 hours per task per day

                if (hoursToAllocate > 0) {
                    dayAllocations.push({
                        ...taskAlloc,
                        allocated_hours: hoursToAllocate,
                    });

                    totalHours += hoursToAllocate;
                    remainingHours.set(taskAlloc.task_id, remaining - hoursToAllocate);
                }
            }

            // Determine workload intensity
            const intensity = this.calculateWorkloadIntensity(totalHours, dailyHours);

            schedule.push({
                date: dateStr,
                total_hours: totalHours,
                allocations: dayAllocations,
                workload_intensity: intensity,
            });

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return schedule;
    }

    /**
     * Calculate workload intensity based on hours
     */
    private calculateWorkloadIntensity(hours: number, maxHours: number): 'light' | 'moderate' | 'heavy' | 'extreme' {
        const ratio = hours / maxHours;

        if (ratio >= 1) return 'extreme';
        if (ratio >= 0.75) return 'heavy';
        if (ratio >= 0.5) return 'moderate';
        return 'light';
    }

    /**
     * Save generated schedules to database
     */
    private async saveSchedules(schedule: DaySchedule[]): Promise<void> {
        for (const day of schedule) {
            if (day.allocations.length > 0) {
                await dailyScheduleService.save({
                    date: day.date,
                    total_hours: day.total_hours,
                    tasks: day.allocations.map(a => ({
                        task_id: a.task_id,
                        allocated_hours: a.allocated_hours,
                        time_slot: a.time_slot,
                    })),
                });
            }
        }
    }

    /**
     * Get AI suggestions for study optimization using Gemini
     */
    async getStudySuggestions(tasks: StudyTask[], exams: Exam[]): Promise<string> {
        const prompt = `You are an AI study planner assistant. Analyze the following study tasks and exams, then provide personalized study suggestions.

Tasks:
${tasks.map(t => `- ${t.title} (${t.subject}, Priority: ${t.priority}, Deadline: ${t.deadline})`).join('\n')}

Upcoming Exams:
${exams.map(e => `- ${e.subject}: ${e.title} on ${e.exam_date}`).join('\n')}

Provide:
1. Top 3 priority tasks to focus on
2. Recommended study techniques for each subject
3. Time management tips
4. Exam preparation strategy

Keep the response concise and actionable.`;

        try {
            const response = await queryAI({
                contextType: 'planner',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            });

            return response.content;
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            return 'Unable to generate AI suggestions at this time.';
        }
    }

    /**
     * Generate micro-deadlines for a large task
     */
    async generateMicroDeadlines(task: StudyTask): Promise<Array<{ title: string; deadline: string; hours: number }>> {
        if (!task.estimated_hours || task.estimated_hours < 4) {
            return []; // Only generate for tasks > 4 hours
        }

        const taskDeadline = task.deadline ? new Date(task.deadline) : new Date();
        const now = new Date();
        const totalDays = Math.ceil((taskDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Split into 3-5 micro-deadlines
        const numMilestones = Math.min(5, Math.max(3, Math.ceil(task.estimated_hours / 2)));
        const hoursPerMilestone = task.estimated_hours / numMilestones;
        const daysPerMilestone = Math.floor(totalDays / numMilestones);

        const microDeadlines = [];
        for (let i = 0; i < numMilestones; i++) {
            const milestoneDate = new Date(now);
            milestoneDate.setDate(milestoneDate.getDate() + (daysPerMilestone * (i + 1)));

            microDeadlines.push({
                title: `${task.title} - Part ${i + 1}/${numMilestones}`,
                deadline: milestoneDate.toISOString(),
                hours: hoursPerMilestone,
            });
        }

        return microDeadlines;
    }

    /**
     * Optimize existing schedule based on completion data
     */
    async optimizeSchedule(startDate: string, endDate: string): Promise<DaySchedule[]> {
        // Get current schedule
        const existingSchedules = await dailyScheduleService.getRange(startDate, endDate);

        // Get updated task statuses
        const tasks = await studyTaskService.getAll();
        const pendingTasks = tasks.filter(t => t.status === 'pending');

        // Regenerate schedule with updated data
        return this.generateSchedule({
            startDate,
            endDate,
        });
    }
}

// Export singleton instance
export const aiSchedulingService = new AISchedulingService();
