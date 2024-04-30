import { v4 as uuidv4 } from 'uuid';
import {Models} from "./models";

enum EventType {
  ACTION = "action",
  LLM = "llm",
  TOOL = "tool",
  ERROR = "error"
}

interface IEvent {
  event_type: EventType;
  params?: Record<string, any>;
  returns?: string;
  init_timestamp?: string;
  end_timestamp?: string;
  agent_id?: string;
  id?: string;
}

export abstract class Event implements IEvent {
  event_type: EventType;
  params?: Record<string, any>;
  returns?: string;
  init_timestamp: string;
  end_timestamp: string;
  agent_id: string;
  id: string;

  constructor(event_type: EventType, params?: Record<string, any>, returns?: string) {
    this.event_type = event_type;
    this.params = params;
    this.returns = returns;
    this.init_timestamp = new Date().toISOString();
    this.end_timestamp = new Date().toISOString();
    this.agent_id = uuidv4();
    this.id = uuidv4();
  }
}

export class ActionEvent extends Event {
  action_type?: string;
  logs?: string;
  screenshot?: string;

  constructor(data: {params?: Record<string, any>, returns?: string, action_type?: string, logs?: string, screenshot?: string}) {
    super(EventType.ACTION, data.params, data.returns);
    this.action_type = data.action_type;
    this.logs = data.logs;
    this.screenshot = data.screenshot;
  }
}

export class LLMEvent extends Event {
  thread_id?: string;
  prompt?: string | string[];
  prompt_tokens?: number;
  completion?: string | object;
  completion_tokens?: number;
  model?: Models | string;

  constructor(data: {params?: Record<string, any>, returns?: string, thread_id?: string, prompt?: string | string[], prompt_tokens?: number, completion?: string | object, completion_tokens?: number, model?: Models | string}) {
    super(EventType.LLM, data.params, data.returns);
    this.thread_id = data.thread_id;
    this.prompt = data.prompt;
    this.prompt_tokens = data.prompt_tokens;
    this.completion = data.completion;
    this.completion_tokens = data.completion_tokens;
    this.model = data.model;
  }
}

export class ToolEvent extends Event {
  name?: string;
  logs?: string | Record<string, any>;

  constructor(params?: Record<string, any>, returns?: string, name?: string, logs?: string | Record<string, any>) {
    super(EventType.TOOL, params, returns);
    this.name = name;
    this.logs = logs;
  }
}

export class ErrorEvent {
  trigger_event?: IEvent;
  exception?: Error;
  error_type?: string;
  code?: string;
  details?: string;
  logs?: string;
  timestamp: string;

  constructor(trigger_event?: IEvent, exception?: Error, error_type?: string, code?: string, details?: string, logs?: string) {
    this.trigger_event = trigger_event;
    this.exception = exception;
    this.error_type = error_type || exception?.name;
    this.code = code;
    this.details = details || exception?.message;
    this.logs = logs || exception?.stack;
    this.timestamp = new Date().toISOString();
  }
}
