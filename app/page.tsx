import { WorkflowForm } from "@/components/workflow-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] p-4 md:p-8">
      <WorkflowForm />
    </main>
  )
}

