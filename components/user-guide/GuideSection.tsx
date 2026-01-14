import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Step {
    title: string
    description: string
}

interface GuideSectionProps {
    id: string
    title: string
    icon: LucideIcon
    description: string
    steps: Step[]
    example?: {
        label: string
        content: string
        image?: string // Potential future use
    }
    tips?: string[]
}

export function GuideSection({ id, title, icon: Icon, description, steps, example, tips }: GuideSectionProps) {
    return (
        <Card id={id} className="scroll-mt-20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription className="text-base mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Steps Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="outline">How to Use</Badge>
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={index} className="relative pl-6 border-l-2 border-primary/20 hover:border-primary transition-colors">
                                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary text-[10px] flex items-center justify-center font-bold">
                                    {index + 1}
                                </span>
                                <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Example Section */}
                {example && (
                    <div className="rounded-lg bg-muted/50 p-4 border">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span className="text-primary">💡</span> Example: {example.label}
                        </h4>
                        <div className="bg-background rounded p-3 text-sm font-mono text-muted-foreground border">
                            {example.content}
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                {tips && tips.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">Pro Tips</h4>
                        <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
                            {tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
