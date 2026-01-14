import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

/**
 * Helper function to run Python scripts via CLI wrapper
 */
function runPythonScript(module: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'backend', 'modules', 'cli_wrapper.py');
        const python = spawn('python3', [scriptPath]);

        let stdout = '';
        let stderr = '';

        // Send data to Python script via stdin
        const payload = { module, ...data };
        python.stdin.write(JSON.stringify(payload));
        python.stdin.end();

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}: ${stderr}`));
            } else {
                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${stdout}`));
                }
            }
        });
    });
}

/**
 * API Route: Generate Cluster Ideas
 * POST /api/content-strategy/generate-clusters
 */
export async function POST(request: NextRequest) {
    try {
        const { pillar_topic, template_type, count } = await request.json();

        if (!pillar_topic) {
            return NextResponse.json(
                { error: 'Pillar topic is required' },
                { status: 400 }
            );
        }

        const result = await runPythonScript('topic_cluster', {
            action: 'generate_ideas',
            pillar_topic,
            template_type: template_type || 'guide',
            count: count || 10
        });

        return NextResponse.json({ ideas: result });

    } catch (error) {
        console.error('Error generating clusters:', error);
        return NextResponse.json(
            { error: 'Failed to generate clusters' },
            { status: 500 }
        );
    }
}
