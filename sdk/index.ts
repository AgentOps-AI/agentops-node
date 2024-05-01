import {Client} from "./src/client";
import {Config} from "./src/types"
import {Session} from "./src/session";
import {ErrorEvent, Event} from "./src/event";


export function init(config?: Config) {
  new Client(config)
}

export function startSession(config?: Config) {
  new Client().startSession(config)
}

export async function endSession(endState: Session['endState'], rating?: Session['rating']) {
  await new Client().endSession(endState, rating)
}

// Same functionality as @record_function decorator in python
export function wrap(func: Function) {
  return new Client().wrap(func)
}

export function record(event: Event | ErrorEvent): void {
  return new Client().record(event)
}

export const agentops = {
  init,
  wrap,
  startSession,
  endSession,
  record
}