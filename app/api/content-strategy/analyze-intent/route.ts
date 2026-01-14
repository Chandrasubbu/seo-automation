import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

/**
 * API Route: Analyze User Intent
 * POST /api/content-strategy/analyze-intent
 */
export async function POST(request: NextRequest) {
    try {
        const { queries } = await request.json();

        if (!queries || !Array.isArray(queries)) {
            return NextResponse.json(
                { error: 'Invalid request. Expected array of queries.' },
                { status: 400 }
            );
        }

        // Call Python backend via CLI wrapper
        const result = await runPythonScript('intent_analyzer', {
            action: 'analyze_batch',
            queries
        });

        // Get distribution
        const distribution = await runPythonScript('intent_analyzer', {
            action: 'get_distribution',
            queries
        });

        return NextResponse.json({
            results: result,
            distribution: distribution
        });

    } catch (error) {
        console.error('Error analyzing intent:', error);
        return NextResponse.json(
            { error: 'Failed to analyze intent' },
            { status: 500 }
        );
    }
}

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
