import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIProvider = 'openai' | 'anthropic' | 'gemini'

export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AIGenerateOptions {
    provider?: AIProvider
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
}

export interface AIGenerateResult {
    content: string
    provider: AIProvider
    model: string
    tokensUsed?: number
}

class AIService {
    private openai: OpenAI | null = null
    private anthropic: Anthropic | null = null
    private gemini: GoogleGenerativeAI | null = null

    constructor() {
        // Initialize available providers
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        }
        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        }
        if (process.env.GOOGLE_API_KEY) {
            this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
        }
    }

    /**
     * Generate content using the specified AI provider
     */
    async generate(
        messages: AIMessage[],
        options: AIGenerateOptions = {}
    ): Promise<AIGenerateResult> {
        const provider = options.provider || this.getDefaultProvider()

        try {
            switch (provider) {
                case 'openai':
                    return await this.generateWithOpenAI(messages, options)
                case 'anthropic':
                    return await this.generateWithAnthropic(messages, options)
                case 'gemini':
                    return await this.generateWithGemini(messages, options)
                default:
                    throw new Error(`Unsupported provider: ${provider}`)
            }
        } catch (error: any) {
            // Fallback to another provider if available
            if (error.message.includes('rate limit') || error.message.includes('quota')) {
                console.warn(`Provider ${provider} failed, attempting fallback...`)
                return await this.generateWithFallback(messages, options, provider)
            }
            throw error
        }
    }

    /**
     * Generate content with OpenAI
     */
    private async generateWithOpenAI(
        messages: AIMessage[],
        options: AIGenerateOptions
    ): Promise<AIGenerateResult> {
        if (!this.openai) throw new Error('OpenAI not configured')

        const model = options.model || 'gpt-4-turbo-preview'

        const response = await this.openai.chat.completions.create({
            model,
            messages: messages.map(m => ({
                role: m.role as 'system' | 'user' | 'assistant',
                content: m.content
            })),
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 4000,
        })

        return {
            content: response.choices[0]?.message?.content || '',
            provider: 'openai',
            model,
            tokensUsed: response.usage?.total_tokens
        }
    }

    /**
     * Generate content with Anthropic Claude
     */
    private async generateWithAnthropic(
        messages: AIMessage[],
        options: AIGenerateOptions
    ): Promise<AIGenerateResult> {
        if (!this.anthropic) throw new Error('Anthropic not configured')

        const model = options.model || 'claude-3-5-sonnet-20241022'
        const systemMessage = messages.find(m => m.role === 'system')
        const userMessages = messages.filter(m => m.role !== 'system')

        const response = await this.anthropic.messages.create({
            model,
            max_tokens: options.maxTokens ?? 4000,
            temperature: options.temperature ?? 0.7,
            system: systemMessage?.content,
            messages: userMessages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            })),
        })

        const content = response.content[0]
        return {
            content: content.type === 'text' ? content.text : '',
            provider: 'anthropic',
            model,
            tokensUsed: response.usage.input_tokens + response.usage.output_tokens
        }
    }

    /**
     * Generate content with Google Gemini
     */
    private async generateWithGemini(
        messages: AIMessage[],
        options: AIGenerateOptions
    ): Promise<AIGenerateResult> {
        if (!this.gemini) throw new Error('Gemini not configured')

        const model = options.model || 'gemini-2.0-flash-exp'
        const geminiModel = this.gemini.getGenerativeModel({
            model,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 4000,
            }
        })

        // Combine messages into a single prompt for Gemini
        const prompt = messages.map(m => {
            if (m.role === 'system') return `System: ${m.content}`
            if (m.role === 'user') return `User: ${m.content}`
            return `Assistant: ${m.content}`
        }).join('\n\n')

        const result = await geminiModel.generateContent(prompt)
        const response = result.response

        return {
            content: response.text(),
            provider: 'gemini',
            model
        }
    }

    /**
     * Attempt to use a fallback provider
     */
    private async generateWithFallback(
        messages: AIMessage[],
        options: AIGenerateOptions,
        failedProvider: AIProvider
    ): Promise<AIGenerateResult> {
        const providers: AIProvider[] = ['openai', 'anthropic', 'gemini']
        const availableProviders = providers.filter(p => {
            if (p === failedProvider) return false
            if (p === 'openai' && this.openai) return true
            if (p === 'anthropic' && this.anthropic) return true
            if (p === 'gemini' && this.gemini) return true
            return false
        })

        if (availableProviders.length === 0) {
            throw new Error('No fallback providers available')
        }

        console.log(`Using fallback provider: ${availableProviders[0]}`)
        return await this.generate(messages, { ...options, provider: availableProviders[0] })
    }

    /**
     * Get the default provider based on what's configured
     */
    private getDefaultProvider(): AIProvider {
        // Prefer OpenAI, then Anthropic, then Gemini
        if (this.openai) return 'openai'
        if (this.anthropic) return 'anthropic'
        if (this.gemini) return 'gemini'
        throw new Error('No AI provider configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY')
    }

    /**
     * Check which providers are available
     */
    getAvailableProviders(): AIProvider[] {
        const providers: AIProvider[] = []
        if (this.openai) providers.push('openai')
        if (this.anthropic) providers.push('anthropic')
        if (this.gemini) providers.push('gemini')
        return providers
    }

    /**
     * Get recommended model for a specific task
     */
    getRecommendedModel(task: 'content' | 'analysis' | 'chat', provider?: AIProvider): string {
        const p = provider || this.getDefaultProvider()

        const models = {
            openai: {
                content: 'gpt-4-turbo-preview',
                analysis: 'gpt-4-turbo-preview',
                chat: 'gpt-4-turbo-preview'
            },
            anthropic: {
                content: 'claude-3-5-sonnet-20241022',
                analysis: 'claude-3-5-sonnet-20241022',
                chat: 'claude-3-5-sonnet-20241022'
            },
            gemini: {
                content: 'gemini-2.0-flash-exp',
                analysis: 'gemini-2.0-flash-exp',
                chat: 'gemini-2.0-flash-exp'
            }
        }

        return models[p][task]
    }
}

// Export singleton instance
export const aiService = new AIService()

// Export class for testing
export { AIService }
