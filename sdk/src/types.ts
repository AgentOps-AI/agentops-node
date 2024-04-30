export type Config = {
  apiKey?: string;
  orgKey?: string;
  tags?: string[];
  endpoint?: string;
  maxWaitTime?: number;
  maxQueueSize?: number
  patchApi?: any[]
}