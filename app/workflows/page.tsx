"use client"

import { useEffect, useState } from "react"
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, Trash2, AlertCircle, Edit2, X } from "lucide-react"

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
    const [runResults, setRunResults] = useState<any | null>(null)
    const [loadingResults, setLoadingResults] = useState(false)
    const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        fetchWorkflows()

        // Listen for workflow creation events
        const handleWorkflowCreated = () => {
            fetchWorkflows()
        }
        
        window.addEventListener('workflowCreated', handleWorkflowCreated)
        return () => window.removeEventListener('workflowCreated', handleWorkflowCreated)
    }, [])

    useEffect(() => {
        if (!selectedRunId || !runResults || runResults.status === 'completed' || runResults.status === 'failed') {
            return
        }

        // Poll for results every 1 second while running
        const interval = setInterval(() => {
            fetchRunResults(selectedRunId)
        }, 1000)

        return () => clearInterval(interval)
    }, [selectedRunId, runResults?.status])

    const fetchWorkflows = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch("/api/workflows")
            if (res.ok) {
                const data = await res.json()
                setWorkflows(data)
            } else {
                setError("Failed to fetch workflows")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    const runWorkflow = async (id: string) => {
        try {
            setLoadingResults(true)
            const res = await fetch(`/api/workflows/${id}/run`, { method: "POST" })
            if (res.ok) {
                const data = await res.json()
                setSelectedRunId(data.runId)
                // Fetch the run results
                setTimeout(() => fetchRunResults(data.runId), 500)
            } else {
                alert("Failed to start workflow")
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setLoadingResults(false)
        }
    }

    const fetchRunResults = async (runId: string) => {
        try {
            const res = await fetch(`/api/workflows/runs/${runId}`)
            if (res.ok) {
                const data = await res.json()
                setRunResults(data)
            }
        } catch (err) {
            console.error("Error fetching run results:", err)
        }
    }

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workflow?")) return
        
        try {
            const res = await fetch(`/api/workflows?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                alert("✓ Workflow deleted successfully!")
                fetchWorkflows()
            } else {
                alert("Failed to delete workflow")
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    const editWorkflow = (workflow: any) => {
        setEditingWorkflow({ ...workflow })
        setShowEditModal(true)
    }

    const saveWorkflowEdit = async () => {
        if (!editingWorkflow.name || !editingWorkflow.steps || editingWorkflow.steps.length === 0) {
            alert("Workflow name and at least one step are required")
            return
        }

        try {
            const res = await fetch("/api/workflows", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingWorkflow.id,
                    name: editingWorkflow.name,
                    schedule: editingWorkflow.schedule,
                    projectId: editingWorkflow.projectId,
                    steps: editingWorkflow.steps
                })
            })

            if (res.ok) {
                alert("✓ Workflow updated successfully!")
                setShowEditModal(false)
                setEditingWorkflow(null)
                fetchWorkflows()
            } else {
                const data = await res.json()
                alert(`Error: ${data.error || 'Failed to update workflow'}`)
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
                <p className="text-muted-foreground mt-2">
                    Create automated workflows to streamline your SEO tasks.
                </p>
            </div>

            {/* Results Display */}
            {runResults && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Workflow Run Results</span>
                            <button 
                                onClick={() => setRunResults(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className={`font-semibold ${
                                    runResults.status === 'completed' ? 'text-green-600' :
                                    runResults.status === 'failed' ? 'text-red-600' :
                                    runResults.status === 'running' ? 'text-blue-600' :
                                    'text-gray-600'
                                }`}>
                                    {runResults.status.toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Started</p>
                                <p className="font-semibold text-sm">
                                    {new Date(runResults.startedAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="font-semibold text-sm">
                                    {runResults.completedAt ? new Date(runResults.completedAt).toLocaleString() : 'In Progress...'}
                                </p>
                            </div>
                        </div>

                        {runResults.output && Object.keys(runResults.output).length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Output</h4>
                                <pre className="text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                                    {JSON.stringify(runResults.output, null, 2)}
                                </pre>
                            </div>
                        )}

                        {runResults.logs && runResults.logs.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Logs</h4>
                                <div className="space-y-1 text-xs font-mono">
                                    {runResults.logs.map((log: any, i: number) => (
                                        <p key={i} className="text-gray-600">
                                            {typeof log === 'string' ? log : JSON.stringify(log)}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Builder Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <WorkflowBuilder />
                </div>

                {/* Workflows List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Workflows</h2>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="text-center py-6 text-muted-foreground">Loading workflows...</div>
                    ) : workflows.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No workflows created yet. Build your first workflow to get started!
                            </CardContent>
                        </Card>
                    ) : (
                        workflows.map(wf => (
                            <Card key={wf.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="p-4 pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <CardTitle className="text-base">{wf.name}</CardTitle>
                                            {wf.schedule && (
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {wf.schedule}
                                                </p>
                                            )}
                                        </div>
                                        {wf.isActive && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded whitespace-nowrap">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-3">
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="flex-1 text-xs"
                                            onClick={() => runWorkflow(wf.id)}
                                        >
                                            <Play className="h-3 w-3 mr-1" /> Run Now
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 text-xs"
                                            onClick={() => editWorkflow(wf)}
                                        >
                                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 text-xs text-red-600 hover:bg-red-50"
                                            onClick={() => deleteWorkflow(wf.id)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingWorkflow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Edit Workflow</CardTitle>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Workflow Name</label>
                                <input 
                                    type="text" 
                                    value={editingWorkflow.name}
                                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Schedule (Cron) - Optional</label>
                                <input 
                                    type="text" 
                                    value={editingWorkflow.schedule || ''}
                                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, schedule: e.target.value })}
                                    placeholder="e.g., 0 9 * * 1"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Steps</label>
                                <div className="space-y-2">
                                    {editingWorkflow.steps?.map((step: any, idx: number) => (
                                        <Card key={idx} className="p-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{step.name}</p>
                                                    <p className="text-xs text-muted-foreground">{step.type}</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="text-xs text-red-600"
                                                    onClick={() => setEditingWorkflow({
                                                        ...editingWorkflow,
                                                        steps: editingWorkflow.steps.filter((_: any, i: number) => i !== idx)
                                                    })}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">You can modify step names and remove steps as needed.</p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={saveWorkflowEdit}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    Save Changes
                                </Button>
                                <Button 
                                    onClick={() => setShowEditModal(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
