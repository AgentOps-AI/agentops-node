import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {startSession, record, endSession, agentops} from '../index';
import {Config} from "../src/types";
import {ActionEvent} from "../src/event";
import {afterEach, describe, test, beforeAll, expect, beforeEach} from "@jest/globals";

describe('TestSessions', () => {
  let mock: MockAdapter;
  const apiKey = "random_api_key";
  const eventType = 'test_event_type';
  let config: Config = {
    apiKey,
    maxWaitTime: 50
  }

  beforeAll(() => {
    mock = new MockAdapter(axios);
    const url = 'https://api.agentops.ai';
    mock.onPost(`${url}/events`).reply(200, 'ok');
    mock.onPost(`${url}/sessions`).reply(200, { status: 'success', token_cost: 5 });
  });

  afterEach(() => {
    mock.resetHistory();
  });

  test('test_session', async () => {
    agentops.init({apiKey, auto_start_session: false})
    startSession(config);

    record(new ActionEvent({action_type: eventType}));
    record(new ActionEvent({action_type: eventType}));

    // We should have 1 request (session start).
    expect(mock.history.post.length).toBe(1);
    await new Promise(r => setTimeout(r, 1000));

    // We should have 2 requests (session and 2 events combined into 1)
    expect(mock.history.post.length).toBe(2);
    expect((mock.history.post[1].headers ?? {})['X-Agentops-Auth']).toBe(apiKey);
    const requestJson = JSON.parse(mock.history.post[1].data);
    expect(requestJson.events[0].event_type).toBe('action');
    expect(requestJson.events[0].action_type).toBe(eventType);

    const endState = 'Success';
    endSession(endState);
    await new Promise(r => setTimeout(r, 150));

    // We should have 3 requests (additional end session)
    expect(mock.history.post.length).toBe(3);
    expect((mock.history.post[2].headers ?? {})['X-Agentops-Auth']).toBe(apiKey);
    const endRequestJson = JSON.parse(mock.history.post[2].data);
    expect(endRequestJson.session.end_state).toBe(endState);
    expect(endRequestJson.session.tags).toStrictEqual([]);
  });

  test('test_tags', async () => {
    const tags = ['test-tags'];
    agentops.init({apiKey, auto_start_session: false})
    await startSession({...config, tags});

    record(new ActionEvent({action_type: eventType}));
    await new Promise(r => setTimeout(r, 1500));

    // Assert 2 requests - 1 for session init, 1 for event
    expect(mock.history.post.length).toBe(2);
    expect((mock.history.post[1].headers ?? {})['X-Agentops-Auth']).toBe(apiKey);
    const requestJson = JSON.parse(mock.history.post[1].data);
    expect(requestJson.events[0].event_type).toBe('action');
    expect(requestJson.events[0].action_type).toBe(eventType);

    const endState = 'Success';
    await endSession(endState);
    // await new Promise(r => setTimeout(r, 150));

    // Assert 3 requests, 1 for session init, 1 for event, 1 for end session
    expect(mock.history.post.length).toBe(3);
    expect((mock.history.post[2].headers ?? {})['X-Agentops-Auth']).toBe(apiKey);
    const endRequestJson = JSON.parse(mock.history.post[2].data);
    expect(endRequestJson.session.end_state).toBe(endState);
    expect(endRequestJson.session.tags).toEqual(tags);
  });

  // Not supported in TypeScript yet
  // test('test_inherit_session_id', async () => {
  //   const inheritedId = '4f72e834-ff26-4802-ba2d-62e7613446f1';
  //   // await startSession(['test'], config, inheritedId);
  //
  //   record(new ActionEvent({action_type: eventType}));
  //   record(new ActionEvent({action_type: eventType}));
  //   await new Promise(r => setTimeout(r, 150));
  //
  //   const requestJson = JSON.parse(mock.history.post[1].data);
  //   expect(requestJson.session_id).toBe(inheritedId);
  //
  //   const endState = 'Success';
  //   endSession(endState);
  //   await new Promise(r => setTimeout(r, 150));
  //
  //   const endRequestJson = JSON.parse(mock.history.post[2].data);
  //   expect(endRequestJson.session.session_id).toBe(inheritedId);
  // });
});
