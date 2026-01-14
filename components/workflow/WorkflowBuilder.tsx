"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowDown, Save, Play } from "lucide-react"

interface WorkflowStep {
    id: string
    name: string
    type: string
    config: Record<string, any>
}

interface Project {
    id: string
    name: string
    description?: string
    clientUrl: string
}

const STEP_TYPES = [
    { value: "generate_content", label: "Generate Content" },
    { value: "analyze_content", label: "Analyze Content" },
    { value: "check_ranking", label: "Check Rankings" },
    { value: "email_report", label: "Email Report" },
    { value: "delay", label: "Delay / Wait" },
]

export default function WorkflowBuilder() {
    const [name, setName] = useState("")
    const [projectId, setProjectId] = useState("")
    const [projects, setProjects] = useState<Project[]>([])
    const [schedule, setSchedule] = useState("")
    const [steps, setSteps] = useState<WorkflowStep[]>([])
    const [saving, setSaving] = useState(false)
    const [projectsLoading, setProjectsLoading] = useState(true)

    const addStep = () => {
        setSteps([
            ...steps,
            {
                id: Math.random().toString(36).substr(2, 9),
                name: `Step ${steps.length + 1}`,
                type: "generate_content",
                config: {},
            },
        ])
    }

    const updateStep = (id: string, field: keyof WorkflowStep, value: any) => {
        setSteps(steps.map(step => (step.id === id ? { ...step, [field]: value } : step)))
    }

    const updateConfig = (id: string, key: string, value: any) => {
        setSteps(
            steps.map(step =>
                step.id === id ? { ...step, config: { ...step.config, [key]: value } } : step
            )
        )
    }

    const removeStep = (id: string) => {
        setSteps(steps.filter(step => step.id !== id))
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/projects")
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data.projects || [])
                }
            } catch (error) {
                console.error("Error fetching projects:", error)
            } finally {
                setProjectsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    const handleSave = async () => {
        if (!name || steps.length === 0) return

        setSaving(true)
        try {
            const res = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, schedule, steps, projectId: projectId || undefined }),
            })

            if (res.ok) {
                const result = await res.json()
                alert(`✓ Workflow "${result.name}" created successfully!`)
                // Reset form
                setName("")
                setProjectId("")
                setSchedule("")
                setSteps([])
                // Trigger parent refresh if available
                window.dispatchEvent(new Event('workflowCreated'))
            } else {
                const error = await res.json()
                alert(`Error: ${error.error || 'Failed to save workflow'}`)
            }
        } catch (error) {
            console.error(error)
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Workflow Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekly Audit" />
                        </div>
                        <div>
                            <Label>Associated Project (Optional)</Label>
                            <Select value={projectId} onValueChange={setProjectId} disabled={projectsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project or leave empty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Schedule (Cron) - Optional</Label>
                        <Input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. 0 9 * * 1 (Every Monday at 9am)" />
                        <p className="text-xs text-muted-foreground mt-1">Leave empty for manual trigger only.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="relative">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="grid gap-2 flex-1 mr-4 md:grid-cols-2">
                                        <Input
                                            value={step.name}
                                            onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                            placeholder="Step Name"
                                        />
                                        <Select
                                            value={step.type}
                                            onValueChange={(val) => updateStep(step.id, 'type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STEP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Config Fields based on Type */}
                                <div className="bg-slate-50 p-3 rounded-md grid gap-3 text-sm">
                                    {step.type === 'generate_content' && (
                                        <div>
                                            <Label>Topic / Keywords</Label>
                                            <Input
                                                value={step.config.topic || ''}
                                                onChange={(e) => updateConfig(step.id, 'topic', e.target.value)}
                                                placeholder="Enter topic to write about"
                                            />
                                        </div>
                                    )}
                                    {step.type === 'analyze_content' && (
                                        <div className="grid gap-2">
                                            <div>
                                                <Label>Content Source</Label>
                                                <Input
                                                    value={step.config.content || ''}
                                                    onChange={(e) => updateConfig(step.id, 'content', e.target.value)}
                                                    placeholder="Text content or {{step_1.output}}"
                                                />
                                            </div>
                                            <div>
                                                <Label>Target Keyword</Label>
                                                <Input
                                                    value={step.config.keyword || ''}
                                                    onChange={(e) => updateConfig(step.id, 'keyword', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {step.type === 'email_report' && (
                                        <div>
                                            <Label>Recipient Email</Label>
                                            <Input
                                                value={step.config.email || ''}
                                                onChange={(e) => updateConfig(step.id, 'email', e.target.value)}
                                                placeholder="me@example.com"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {index < steps.length && (
                            <div className="flex justify-center py-2">
                                <ArrowDown className="text-muted-foreground h-5 w-5" />
                            </div>
                        )}
                    </div>
                ))}

                <Button onClick={addStep} variant="outline" className="w-full border-dashed">
                    <Plus className="mr-2 h-4 w-4" /> Add Next Step
                </Button>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={saving || !name} className="min-w-[150px]">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Workflow'}
                </Button>
            </div>
        </div>
    )
}
