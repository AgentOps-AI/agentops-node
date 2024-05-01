export type Config = {
  apiKey?: string;
  parentKey?: string;
  tags?: string[];
  endpoint?: string;
  maxWaitTime?: number;
  maxQueueSize?: number
  patchApi?: any[],
  instrument_llm_calls?: boolean, // default true
  auto_start_session?: boolean, // default true
  inherited_session_id?: string
  env_data_opt_out?: boolean // default false
}