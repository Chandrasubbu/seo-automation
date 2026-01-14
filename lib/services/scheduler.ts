import cron from "node-cron"
import { prisma } from "@/lib/db"
import { workflowEngine } from "./workflow-engine"

class SchedulerService {
    private jobs: Map<string, cron.ScheduledTask> = new Map()

    /**
     * Initialize scheduler: Load active workflows and schedule them
     */
    async init() {
        console.log("Initializing Scheduler...")

        try {
            const activeWorkflows = await prisma.workflow.findMany({
                where: { isActive: true, schedule: { not: null } }
            })

            // Clear existing jobs (if re-initializing)
            this.jobs.forEach(job => job.stop())
            this.jobs.clear()

            for (const workflow of activeWorkflows) {
                if (workflow.schedule) {
                    this.scheduleWorkflow(workflow.id, workflow.schedule)
                }
            }

            console.log(`Scheduler started with ${this.jobs.size} active jobs.`)
        } catch (error) {
            console.error("Failed to initialize scheduler:", error)
        }
    }

    /**
     * Schedule a specific workflow
     */
    scheduleWorkflow(workflowId: string, cronExpression: string) {
        // Validate cron
        if (!cron.validate(cronExpression)) {
            console.error(`Invalid cron expression for workflow ${workflowId}: ${cronExpression}`)
            return
        }

        // Stop existing if any
        if (this.jobs.has(workflowId)) {
            this.jobs.get(workflowId)?.stop()
        }

        const task = cron.schedule(cronExpression, async () => {
            console.log(`Triggering scheduled workflow: ${workflowId}`)
            await workflowEngine.executeWorkflow(workflowId)
        })

        this.jobs.set(workflowId, task)
    }

    /**
     * Stop a workflow schedule
     */
    stopWorkflow(workflowId: string) {
        if (this.jobs.has(workflowId)) {
            this.jobs.get(workflowId)?.stop()
            this.jobs.delete(workflowId)
        }
    }
}

export const schedulerService = new SchedulerService()
