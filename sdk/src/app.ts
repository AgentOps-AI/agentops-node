import { postEvents, postSession } from "./http";
import { Session } from "./session";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { APIPromise, RequestOptions } from 'openai/core';
import { Stream } from "openai/streaming";
import {
    ChatCompletion,
    ChatCompletionChunk,
    ChatCompletionCreateParamsBase,
    ChatCompletionCreateParamsNonStreaming,
    ChatCompletionCreateParamsStreaming,
} from 'openai/resources/chat/completions';

dotenv.config();

export class Client {
    private apiKey: string;
    private orgKey: string;
    private session: Session | null = null;
    private endpoint = 'https://agentops-server-v2.fly.dev';
    private maxQueueSize = 100;
    private queue: any[] = [];
    private worker: NodeJS.Timeout | null = null;

    constructor(config: {
        apiKey?: string;
        orgKey?: string;
        tags?: string[];
        endpoint?: string;
        maxWaitTime?: number;
        maxQueueSize?: number
        patchApi?: any[]
    }) {
        this.apiKey = config.apiKey || process.env.AGENTOPS_API_KEY || '';

        if (!this.apiKey) {
            console.log('AgentOps API key not provided. Session data will not be recorded.');
        }

        this.orgKey = config.orgKey || process.env.AGENTOPS_ORG_KEY || '';

        if (this.apiKey) {
            this.session = new Session(uuidv4(), config.tags);
            if (config.endpoint) this.endpoint = config.endpoint;
            if (config.maxQueueSize) this.maxQueueSize = config.maxQueueSize;
            postSession(this.endpoint, this.session, this.apiKey, this.orgKey);
            this.setupWorker(config.maxWaitTime || 1000);

            config.patchApi?.forEach((api) => this.patchApi(api))
        }
    }

    private setupWorker(maxWaitTime: number) {
        this.worker = setInterval(() => this.flushQueue(), maxWaitTime);

        // Don't let the "worker" prevent Nodejs from exiting
        this.worker.unref();

        // Handle exit signals
        process.on('SIGINT', this.cleanup.bind(this));
        process.on('SIGTERM', this.cleanup.bind(this));
    }

    private async cleanup() {
        if (this.worker) {
            clearInterval(this.worker);
            this.worker = null;
        }

        if (this.session && !this.session.hasEnded()) {
            await this.endSession('Fail');
        }

        process.exit(0);
    }

    private flushQueue() {
        if (this.apiKey) {
            const events = this.queue.slice();
            this.queue = [];
            postEvents(this.endpoint, events, this.apiKey, this.orgKey);
        }
    }

    patchApi(api: OpenAI) {
        if (api && typeof api.chat.completions.create === 'function') {
            const openai = api;

            const originalChatCompletion = openai.chat.completions.create.bind(openai.chat.completions);

            // We need to do this overloaded function to match chat.completions.create as it is also an overloaded function
            function createChatCompletion(
                body: ChatCompletionCreateParamsNonStreaming,
                options?: RequestOptions): APIPromise<ChatCompletion>;
            function createChatCompletion(
                body: ChatCompletionCreateParamsStreaming,
                options?: RequestOptions): APIPromise<Stream<ChatCompletionChunk>>;
            function createChatCompletion(
                body: ChatCompletionCreateParamsBase,
                options?: RequestOptions): APIPromise<ChatCompletion>;


            function createChatCompletion(
                body: ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsBase | ChatCompletionCreateParamsStreaming,
                options?: RequestOptions
            ): APIPromise<ChatCompletion | Stream<ChatCompletionChunk>> {
                const timer = new Date().toISOString();
                const response = originalChatCompletion(body, options);
                if (body.stream === true) {
                    return response as APIPromise<Stream<ChatCompletionChunk>>;
                } else handleResponse(
                    "chat.completion",
                    body,
                    response as APIPromise<ChatCompletion>,
                    timer);
                return response;
            }
            openai.chat.completions.create = createChatCompletion;
        }

        const handleResponse = async (
            type: string,
            body: ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsBase,
            response: APIPromise<ChatCompletion>,
            timer: string
        ) => {
            const res = await response;
            const event = new Event(
                type,
                body,
                { content: res.choices[0]['message']['content'] },
                "Success",
                [],
                "llm",
                res['model'],
                body['messages'],
                timer);
            this.record(event);
        }
    }

    wrap(func: Function, tags?: string[]) {
        const record = async (args: any, response: any, timer: string) => {
            const res = response;
            const event = new Event(
                func.name,
                args,
                res,
                'Success',
                tags,
                'action',
                undefined,
                undefined,
                timer
            );
            this.record(event);
        };

        const originalMethod = func;

        func = (...args: any) => {
            const timer = new Date().toISOString();
            const response = originalMethod.apply(this, args);
            record(args, response, timer);
            return response;
        };

        return func;
    }

    record(event: Event): void {
        if (this.session && !this.session.hasEnded()) {
            this.queue.push({
                session_id: this.session.sessionId,
                ...event
            });
            if (this.queue.length > this.maxQueueSize) this.flushQueue();
        } else {
            console.info('Warning: This event was not recorded because the previous session has been ended. Start a new session to record again.');
        }
    }

    async endSession(endState: Session['endState'], rating?: Session['rating']): Promise<void> {
        if (this.session && !this.session.hasEnded()) {
            if (this.worker) clearInterval(this.worker);
            this.flushQueue();
            this.session.endSession(endState, rating);
            await postSession(this.endpoint, this.session, this.apiKey, this.orgKey);
        } else {
            console.info('Warning: The session has already been ended.');
        }
    }
}

export interface Event {
    eventType: string;
    params: string | object;
    returns: string | object;
    result: 'Indeterminate' | 'Success' | 'Fail';
    tags: string[];
    actionType: 'action' | 'api' | 'llm';
    model: string;
    prompt: string | object;
    endTimestamp: string;
    initTimestamp: string;
}

export class Event implements Event {
    constructor(
        eventType: Event['eventType'],
        params?: Event['params'],
        returns?: Event['returns'],
        result?: Event['result'],
        tags?: Event['tags'],
        actionType?: Event['actionType'],
        model?: Event['model'],
        prompt?: Event['prompt'],
        initTimestamp?: Event['initTimestamp']
    ) {
        this.eventType = eventType;
        this.params = params || '';
        this.returns = returns || '';
        this.result = result || 'Indeterminate';
        this.tags = tags || [];
        this.actionType = actionType || 'action';
        this.model = model || '';
        this.prompt = prompt || '';
        this.endTimestamp = new Date().toISOString();
        this.initTimestamp = initTimestamp || this.endTimestamp;
    }
}
