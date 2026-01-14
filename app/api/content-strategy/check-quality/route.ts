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
 * API Route: Check Content Quality
 * POST /api/content-strategy/check-quality
 */
export async function POST(request: NextRequest) {
    try {
        const { content, metadata } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const result = await runPythonScript('quality_checker', {
            action: 'check_quality',
            content,
            metadata: metadata || {}
        });

        return NextResponse.json({ score: result });

    } catch (error) {
        console.error('Error checking quality:', error);
        return NextResponse.json(
            { error: 'Failed to check content quality' },
            { status: 500 }
        );
    }
}
