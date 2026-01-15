import cron, { ScheduledTask } from "node-cron"
import { prisma } from "./db"
import { contentOptimizer } from "./content-optimizer"
import { serpService } from "./serp-service"
import { keywordService } from "./keyword-service"
import { emailService } from "./email-service"

export interface TaskConfig {
    contentAudit?: {
        urls: string[]
        targetKeywords: string[]
    }
    serpCheck?: {
        keywords: string[]
        location?: string
    }
    keywordUpdate?: {
        keywords: string[]
    }
    weeklyReport?: {
        recipientEmail: string
    }
}

export interface TaskExecution {
    taskId: string
    status: "running" | "completed" | "failed"
    startTime: Date
    endTime?: Date
    result?: unknown
    error?: string
}

type TaskType = "content_audit" | "serp_check" | "keyword_update" | "weekly_report"

/**
 * Workflow Engine
 * Manages scheduled tasks and their execution
 */
class WorkflowEngine {
    private scheduledJobs: Map<string, ScheduledTask> = new Map()
    private runningTasks: Map<string, TaskExecution> = new Map()

    /**
     * Initialize workflow engine and load scheduled tasks
     */
    async initialize() {
        try {
            const tasks = await prisma.scheduledTask.findMany({
                where: { enabled: true },
            })

            for (const task of tasks) {
                this.scheduleTask(task.id, task.schedule, task.type as TaskType, task.config as TaskConfig)
            }

            console.log(`Workflow engine initialized with ${tasks.length} scheduled tasks`)
        } catch (error) {
            console.error("Failed to initialize workflow engine:", error)
        }
    }

    /**
     * Schedule a task with cron expression
     */
    scheduleTask(
        taskId: string,
        schedule: string,
        type: TaskType,
        config: TaskConfig
    ): boolean {
        if (!cron.validate(schedule)) {
            console.error(`Invalid cron expression: ${schedule}`)
            return false
        }

        // Cancel existing job if any
        this.cancelTask(taskId)

        const job = cron.schedule(schedule, async () => {
            await this.executeTask(taskId, type, config)
        })

        this.scheduledJobs.set(taskId, job)
        return true
    }

    /**
     * Cancel a scheduled task
     */
    cancelTask(taskId: string): boolean {
        const job = this.scheduledJobs.get(taskId)
        if (job) {
            job.stop()
            this.scheduledJobs.delete(taskId)
            return true
        }
        return false
    }

    /**
     * Execute a task immediately
     */
    async executeTask(
        taskId: string,
        type: TaskType,
        config: TaskConfig
    ): Promise<TaskExecution> {
        const execution: TaskExecution = {
            taskId,
            status: "running",
            startTime: new Date(),
        }

        this.runningTasks.set(taskId, execution)

        try {
            let result: unknown

            switch (type) {
                case "content_audit":
                    result = await this.runContentAudit(config.contentAudit)
                    break
                case "serp_check":
                    result = await this.runSerpCheck(config.serpCheck)
                    break
                case "keyword_update":
                    result = await this.runKeywordUpdate(config.keywordUpdate)
                    break
                case "weekly_report":
                    result = await this.runWeeklyReport(config.weeklyReport)
                    break
                default:
                    throw new Error(`Unknown task type: ${type}`)
            }

            execution.status = "completed"
            execution.endTime = new Date()
            execution.result = result

            // Update task in database
            await prisma.scheduledTask.update({
                where: { id: taskId },
                data: {
                    lastRun: new Date(),
                    nextRun: this.calculateNextRun(taskId),
                },
            })
        } catch (error) {
            execution.status = "failed"
            execution.endTime = new Date()
            execution.error = error instanceof Error ? error.message : "Unknown error"
            console.error(`Task ${taskId} failed:`, error)
        }

        this.runningTasks.delete(taskId)
        return execution
    }

    /**
     * Calculate next run time for a task
     */
    private calculateNextRun(taskId: string): Date | null {
        const job = this.scheduledJobs.get(taskId)
        if (!job) return null

        // This is a simplified calculation
        // In production, you'd use a proper cron parser
        return new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24 hours
    }

    /**
     * Run content audit task
     */
    private async runContentAudit(config?: TaskConfig["contentAudit"]) {
        if (!config) throw new Error("Content audit config is required")

        const results = []
        for (const keyword of config.targetKeywords) {
            const audit = await contentOptimizer.auditContent(
                "", // Would need to fetch actual content
                keyword
            )
            results.push({ keyword, score: audit.score, issues: audit.issues.length })
        }

        return { audited: results.length, results }
    }

    /**
     * Run SERP check task
     */
    private async runSerpCheck(config?: TaskConfig["serpCheck"]) {
        if (!config) throw new Error("SERP check config is required")

        const results = []
        for (const keyword of config.keywords) {
            const serp = await serpService.analyze(keyword, config.location)
            results.push({ keyword, rankings: serp.results?.length || 0 })
        }

        return { checked: results.length, results }
    }

    /**
     * Run keyword update task
     */
    private async runKeywordUpdate(config?: TaskConfig["keywordUpdate"]) {
        if (!config) throw new Error("Keyword update config is required")

        const results = []
        for (const keyword of config.keywords) {
            const research = await keywordService.research(keyword)
            results.push({
                keyword,
                volume: research.mainKeyword.searchVolume,
                difficulty: research.mainKeyword.difficulty,
            })
        }

        return { updated: results.length, results }
    }

    /**
     * Run weekly report task
     */
    private async runWeeklyReport(config?: TaskConfig["weeklyReport"]) {
        if (!config) throw new Error("Weekly report config is required")

        // Gather stats for the week
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const [analyses, clusters, keywords, serpResults] = await Promise.all([
            prisma.analysisResult.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.topicCluster.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.keywordResearch.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.serpAnalysis.count({ where: { createdAt: { gte: weekAgo } } }),
        ])

        const report = {
            period: "Last 7 days",
            stats: {
                newAnalyses: analyses,
                newClusters: clusters,
                newKeywords: keywords,
                newSerpResults: serpResults,
            },
        }

        // Send email
        await emailService.sendWeeklyReport(config.recipientEmail, report)

        return report
    }

    /**
     * Get all scheduled tasks
     */
    getScheduledTasks(): string[] {
        return Array.from(this.scheduledJobs.keys())
    }

    /**
     * Get running tasks
     */
    getRunningTasks(): TaskExecution[] {
        return Array.from(this.runningTasks.values())
    }

    /**
     * Check if a task is running
     */
    isTaskRunning(taskId: string): boolean {
        return this.runningTasks.has(taskId)
    }
}

export const workflowEngine = new WorkflowEngine()
