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
 * API Route: Analyze Topic Cluster
 * POST /api/content-strategy/analyze-cluster
 */
export async function POST(request: NextRequest) {
    try {
        const { pillar } = await request.json();

        if (!pillar) {
            return NextResponse.json(
                { error: 'Pillar data is required' },
                { status: 400 }
            );
        }

        const [analysis, linkingStrategy] = await Promise.all([
            runPythonScript('topic_cluster', {
                action: 'analyze_coverage',
                pillar
            }),
            runPythonScript('topic_cluster', {
                action: 'generate_linking_strategy',
                pillar
            })
        ]);

        return NextResponse.json({
            analysis,
            linking_strategy: linkingStrategy
        });

    } catch (error) {
        console.error('Error analyzing cluster:', error);
        return NextResponse.json(
            { error: 'Failed to analyze cluster' },
            { status: 500 }
        );
    }
}
