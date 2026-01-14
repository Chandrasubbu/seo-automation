"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Play,
    Pause,
    Trash2,
    Clock,
    RefreshCw,
    CalendarClock,
    Settings,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react"

interface ScheduledTask {
    id: string
    name: string
    type: string
    schedule: string
    config: Record<string, unknown>
    enabled: boolean
    lastRun: string | null
    nextRun: string | null
    createdAt: string
}

interface Project {
    id: string
    name: string
    description?: string
    clientUrl: string
}

interface TaskConfig {
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

const TASK_TYPES = [
    { value: "content_audit", label: "Content Audit", description: "Automatically audit content quality" },
    { value: "serp_check", label: "SERP Check", description: "Track keyword rankings" },
    { value: "keyword_update", label: "Keyword Update", description: "Refresh keyword data" },
    { value: "weekly_report", label: "Weekly Report", description: "Send weekly email summary" },
]

const SCHEDULE_PRESETS = [
    { value: "0 9 * * *", label: "Daily at 9 AM" },
    { value: "0 9 * * 1", label: "Weekly (Monday 9 AM)" },
    { value: "0 9 1 * *", label: "Monthly (1st at 9 AM)" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 */12 * * *", label: "Every 12 hours" },
]

export function WorkflowBuilder() {
    const [tasks, setTasks] = useState<ScheduledTask[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

    // New task form state
    const [newTask, setNewTask] = useState({
        name: "",
        type: "content_audit",
        schedule: "0 9 * * 1",
        projectId: "",
        config: {} as TaskConfig,
    })

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/workflows")
            if (res.status === 401) {
                setError("Please log in to manage workflows")
                setLoading(false)
                return
            }
            if (!res.ok) throw new Error("Failed to fetch tasks")
            const data = await res.json()
            setTasks(data.tasks || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const fetchProjects = async () => {
        setProjectsLoading(true)
        try {
            const res = await fetch("/api/projects")
            if (!res.ok) throw new Error("Failed to fetch projects")
            const data = await res.json()
            setProjects(data.projects || [])
        } catch (err) {
            console.error("Error fetching projects:", err)
        } finally {
            setProjectsLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    useEffect(() => {
        if (showCreateModal) {
            fetchProjects()
        }
    }, [showCreateModal])

    const handleCreateTask = async () => {
        try {
            // Convert task format to steps format expected by API
            const workflowData = {
                name: newTask.name,
                schedule: newTask.schedule,
                projectId: newTask.projectId || undefined,
                steps: [
                    {
                        name: newTask.name,
                        type: newTask.type,
                        config: newTask.config,
                    }
                ]
            }

            const res = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(workflowData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to create workflow")
            }

            setShowCreateModal(false)
            setNewTask({ name: "", type: "content_audit", schedule: "0 9 * * 1", projectId: "", config: {} })
            setError("")
            fetchTasks()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        }
    }

    const handleToggleTask = async (task: ScheduledTask) => {
        try {
            const res = await fetch("/api/workflows", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: task.id, enabled: !task.enabled }),
            })

            if (!res.ok) throw new Error("Failed to update task")
            fetchTasks()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        }
    }

    const handleDeleteTask = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workflow?")) return

        try {
            const res = await fetch(`/api/workflows?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete task")
            fetchTasks()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        }
    }

    const handleRunTask = async (id: string) => {
        setRunningTasks((prev) => new Set([...prev, id]))

        try {
            const res = await fetch(`/api/workflows/${id}/run`, {
                method: "POST",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to run task")
            }

            fetchTasks()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setRunningTasks((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    const getTypeLabel = (type: string) => {
        return TASK_TYPES.find((t) => t.value === type)?.label || type
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never"
        return new Date(dateStr).toLocaleString()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="flex items-center gap-3 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Loading workflows...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Workflow Automation</h1>
                        <p className="text-gray-400 mt-1">Schedule and manage automated SEO tasks</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Workflow
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {error}
                        <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-300">
                            ×
                        </button>
                    </div>
                )}

                {/* Task List */}
                {tasks.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                        <CalendarClock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Workflows Yet</h3>
                        <p className="text-gray-400 mb-6">
                            Create your first automated workflow to schedule SEO tasks
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                        >
                            Create Your First Workflow
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${task.enabled
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-gray-500/20 text-gray-400"
                                                    }`}
                                            >
                                                {task.enabled ? "Active" : "Paused"}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">{getTypeLabel(task.type)}</p>

                                        <div className="flex items-center gap-6 mt-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>Schedule: {task.schedule}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Last run: {formatDate(task.lastRun)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRunTask(task.id)}
                                            disabled={runningTasks.has(task.id)}
                                            className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Run now"
                                        >
                                            {runningTasks.has(task.id) ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Play className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleToggleTask(task)}
                                            className={`p-2 rounded-lg transition ${task.enabled
                                                    ? "bg-white/10 text-yellow-400 hover:bg-yellow-500/20"
                                                    : "bg-white/10 text-green-400 hover:bg-green-500/20"
                                                }`}
                                            title={task.enabled ? "Pause" : "Resume"}
                                        >
                                            {task.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Create Workflow</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setError("")
                                    }}
                                    className="text-gray-400 hover:text-gray-300 transition text-2xl leading-none"
                                    title="Close"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Project Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Associated Project (Optional)
                                    </label>
                                    <select
                                        value={newTask.projectId}
                                        onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                        disabled={projectsLoading}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                    {projectsLoading && <p className="text-sm text-gray-400 mt-1">Loading projects...</p>}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Workflow Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newTask.name}
                                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                        placeholder="e.g., Weekly Keyword Check"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Task Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TASK_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setNewTask({ ...newTask, type: type.value })}
                                                className={`p-3 rounded-lg text-left transition ${newTask.type === type.value
                                                        ? "bg-purple-500/30 border-purple-500"
                                                        : "bg-white/5 border-white/10"
                                                    } border`}
                                            >
                                                <p className="text-white font-medium text-sm">{type.label}</p>
                                                <p className="text-gray-400 text-xs mt-1">{type.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                                    <select
                                        value={newTask.schedule}
                                        onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    >
                                        {SCHEDULE_PRESETS.map((preset) => (
                                            <option key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type-specific config */}
                                {newTask.type === "weekly_report" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            value={(newTask.config.weeklyReport?.recipientEmail) || ""}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    config: {
                                                        ...newTask.config,
                                                        weeklyReport: { recipientEmail: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                )}

                                {newTask.type === "serp_check" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Keywords (comma-separated)
                                        </label>
                                        <textarea
                                            value={(newTask.config.serpCheck?.keywords || []).join(", ")}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    config: {
                                                        ...newTask.config,
                                                        serpCheck: {
                                                            keywords: e.target.value.split(",").map((k) => k.trim()),
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                                            placeholder="seo tools, content marketing, keyword research"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setError("")
                                    }}
                                    className="flex-1 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 transition"
                                >
                                    Exit / Cancel
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={!newTask.name}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Workflow
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
