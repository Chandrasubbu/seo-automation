// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
        // New window
        requestCounts.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxRequests) {
        return false; // Rate limit exceeded
    }

    record.count++;
    return true;
}

export function getRateLimitInfo(identifier: string): { remaining: number; resetIn: number } {
    const record = requestCounts.get(identifier);
    if (!record) {
        return { remaining: 5, resetIn: 60000 };
    }

    const now = Date.now();
    if (now > record.resetTime) {
        return { remaining: 5, resetIn: 60000 };
    }

    return {
        remaining: Math.max(0, 5 - record.count),
        resetIn: record.resetTime - now
    };
}
