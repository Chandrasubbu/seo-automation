import { prisma } from "@/lib/db"
import { optimizationEngine } from "./optimization-engine"
// import { searchConsoleService } from "./search-console" // Will integrate if needed

export class WorkflowEngine {

    /**
     * Triggers the execution of a workflow.
     * Creates a run record and executes steps sequentially.
     */
    async executeWorkflow(workflowId: string): Promise<string> {
        // 1. Create a run record
        const run = await prisma.workflowRun.create({
            data: {
                workflowId,
                status: "running",
                logs: [],
                output: {}
            }
        })

        // 2. Fetch workflow steps
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!workflow || !workflow.steps.length) {
            await this.updateRunStatus(run.id, "failed", ["Workflow has no steps"])
            return run.id
        }

        // 3. Execute steps asynchronously (fire and forget the promise, or await if cron needs it)
        this.processSteps(run.id, workflow.steps)

        return run.id
    }

    /**
     * Process steps one by one
     */
    private async processSteps(runId: string, steps: any[]) {
        const logs: string[] = ["Workflow started"]
        let context: any = {} // Shared data between steps

        try {
            for (const step of steps) {
                logs.push(`Starting step: ${step.name} (${step.type})`)
                await this.updateRunLogs(runId, logs)

                const result = await this.executeStep(step, context)

                // Update context with result
                context = { ...context, [step.id]: result }
                logs.push(`Completed step: ${step.name}`)
            }

            await this.updateRunStatus(runId, "completed", logs, context)
        } catch (error: any) {
            console.error(`Workflow run ${runId} failed:`, error)
            logs.push(`Error: ${error.message}`)
            await this.updateRunStatus(runId, "failed", logs)
        }
    }

    /**
     * Execute a single step based on type
     */
    private async executeStep(step: any, context: any) {
        const config = step.config as any || {}

        switch (step.type) {
            case "generate_content":
                // TODO: Integrate with real content generation service
                throw new Error('generate_content step requires content generation service integration');

            case "analyze_content":
                // Uses OptimizationEngine for rule-based SEO analysis
                if (!config.content) return { error: "No content provided" }
                return await optimizationEngine.analyzeSEO(config.content, config.keyword || "seo")

            case "check_ranking":
                // TODO: Integrate with real rank tracking service (SERP API, Google Search Console)
                throw new Error('check_ranking step requires rank tracking integration');

            case "email_report":
                // TODO: Integrate with email service (SendGrid, AWS SES)
                throw new Error('email_report step requires email service integration');

            case "delay":
                await new Promise(r => setTimeout(r, config.ms || 1000))
                return { waited: config.ms }

            default:
                throw new Error(`Unknown step type: ${step.type}`)
        }
    }

    private async updateRunLogs(runId: string, logs: string[]) {
        await prisma.workflowRun.update({
            where: { id: runId },
            data: { logs: logs as any } // Cast for Prisma JSON
        })
    }

    private async updateRunStatus(runId: string, status: string, logs: string[], output: any = null) {
        await prisma.workflowRun.update({
            where: { id: runId },
            data: {
                status,
                logs: logs as any,
                output: output ? (output as any) : undefined,
                completedAt: status !== "running" ? new Date() : null
            }
        })
    }
}

export const workflowEngine = new WorkflowEngine()
