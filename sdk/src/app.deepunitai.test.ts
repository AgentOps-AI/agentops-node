import dotenv from "dotenv";
import OpenAI from "openai";
import { postEvents, postSession } from "./http";
import { Session } from "./session";
import { uuidv4 } from "uuid";
import { APIPromise, RequestOptions } from "openai/core";
import { Stream } from "openai/streaming";
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
} from "openai/resources/chat/completions";
import { Client, Event } from "./app";

jest.mock("./session");

jest.mock("uuid");

jest.mock("dotenv");

jest.mock("openai");
// Mocking modules as the actual implementations are not required for unit tests
jest.mock("./http");

// Mock the necessary modules

// Mock the necessary modules
describe("Client", function () {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("record", () => {
    it("should add event to the queue if session is active", () => {
      // Arrange
      const event = new Event(
        "eventType",
        "params",
        "returns",
        "Success",
        ["tag"],
        "action",
        "model",
        "prompt",
        "initTimestamp"
      );
      const mockSession = {
        sessionId: "session123",
        endState: "Success",
        tags: ["tag"],
        initTimestamp: "initTimestamp",
        endTimestamp: "endTimestamp",
        hasEnded: jest.fn().mockReturnValue(false),
        rating: null, // Add a default value for the missing rating property
        endSession: jest.fn() // Add a jest mock function for the missing endSession method
      };
      const client = new Client({});
      client.session = mockSession;
      client.queue = [];
      // Act
      client.record(event);
      // Assert
      expect(client.queue).toEqual([
        {
          session_id: "session123",
          eventType: "eventType",
          params: "params",
          returns: "returns",
          result: "result",
          tags: ["tag"],
          actionType: "actionType",
          model: "model",
          prompt: "prompt",
          initTimestamp: "initTimestamp",
        },
      ]);
    });
    it("should log a warning if session has ended", () => {
      // Arrange
      const event = new Event(
        "eventType",
        "params",
        "returns",
        "Success",
        ["tag"],
        "action",
        "model",
        "prompt",
        "initTimestamp"
      );
      const mockSession = {
        sessionId: "session123",
        hasEnded: jest.fn().mockReturnValue(true),
      };
      const mockConsoleInfo = jest.spyOn(console, "info");
      const client = new Client({});
      client.session = mockSession;
      // Act
      client.record(event);
      // Assert
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        "Warning: This event was not recorded because the previous session has been ended. Start a new session to record again."
      );
    });
  });
  describe("patchApi", () => {
    it("should patch the createChatCompletion function if api.chat.completions.create exists", () => {
      // Arrange
      const mockOriginalChatCompletion = jest.fn();
      const mockOpenAI = {
        chat: {
          completions: {
            create: mockOriginalChatCompletion,
          },
        },
      };
      const client = new Client({});
      client.patchApi(mockOpenAI);
      // Act
      client.patchApi(mockOpenAI);
      client.patchApi(mockOpenAI);
      // Assert
      expect(mockOriginalChatCompletion).toHaveBeenCalledTimes(1);
      expect(mockOriginalChatCompletion).toHaveBeenCalledWith(
        expect.any(Object),
        undefined
      );
      expect(mockOpenAI.chat.completions.create).toBeInstanceOf(Function);
    });
  });
});

// Mocking modules as the actual implementations are not required for unit tests

// Mocking modules as the actual implementations are not required for unit tests
describe("Client", function () {
  let client: Client;
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue("test-id");
    client = new Client({ apiKey: "test-key", orgKey: "test-org-key" });
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("constructor", () => {
    // Test to verify if new session is created with provided config
    it("should create new session with provided config", () => {
      expect(Session).toHaveBeenCalledWith("test-id", undefined);
      expect(postSession).toHaveBeenCalledWith(
        undefined,
        expect.any(Session),
        "test-key",
        "test-org-key"
      );
    });
  });
  describe("record", () => {
    // Test to verify if event is recorded and added to the queue
    it("should record event and add it to the queue", () => {
      const event = new Event("test-event");
      (client.session.hasEnded as jest.Mock).mockReturnValue(false);
      client.record(event);
      expect(client.queue).toHaveLength(1);
      expect(client.queue[0]).toBe(event);
    });
    // Test to verify if event is not recorded when session has ended
    it("should not record event when session has ended", () => {
      const event = new Event("test-event");
      (client.session.hasEnded as jest.Mock).mockReturnValue(true);
      client.record(event);
      expect(client.queue).toHaveLength(0);
      expect(console.info).toHaveBeenCalledWith(
        "Warning: This event was not recorded because the previous session has been ended. Start a new session to record again."
      );
    });
  });
  describe("wrap", () => {
    // Test to verify if function is wrapped and event is recorded
    it("should wrap function and record event", () => {
      const func = jest.fn().mockReturnValue("test-result");
      const wrappedFunc = client.wrap(func);
      const result = wrappedFunc("test-arg");
      expect(func).toHaveBeenCalledWith("test-arg");
      expect(result).toBe("test-result");
      expect(client.record).toHaveBeenCalled();
    });
  });
});

describe("Client", function () {
  let client;
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should instantiate with config", () => {
    // Mock uuidv4 function to return a static uuid
    (uuidv4 as jest.Mock).mockReturnValue("test-uuid");
    client = new Client({
      apiKey: "test-api-key",
      orgKey: "test-org-key",
      tags: ["test"],
      endpoint: "test-endpoint",
      maxWaitTime: 5000,
      maxQueueSize: 200,
      patchApi: [],
    });
    // Verify that client is instantiated with expected properties
    expect(client.apiKey).toBe("test-api-key");
    expect(client.orgKey).toBe("test-org-key");
    expect(client.endpoint).toBe("test-endpoint");
    expect(client.maxQueueSize).toBe(200);
    // Verify that session is created with expected parameters
    expect(Session).toHaveBeenCalledWith("test-uuid", ["test"]);
    // Verify that postSession is called with expected parameters
    expect(postSession).toHaveBeenCalledWith(
      "test-endpoint",
      expect.any(Session),
      "test-api-key",
      "test-org-key"
    );
  });
  it("should record an event", () => {
    const event = new Event("test-event");
    client.record(event);
    // Verify that event is pushed to the queue
    expect(client.queue).toHaveLength(1);
    expect(client.queue[0]).toMatchObject({
      session_id: expect.any(String),
      ...event,
    });
  });
  it("should flush the queue when maxQueueSize is reached", () => {
    const event = new Event("test-event");
    // Enqueue maxQueueSize + 1 events
    for (let i = 0; i < client.maxQueueSize + 1; i++) {
      client.record(event);
    }
    // Verify that postEvents is called with expected parameters
    expect(postEvents).toHaveBeenCalledWith(
      client.endpoint,
      expect.any(Array),
      client.apiKey,
      client.orgKey
    );
    // Verify that the queue is flushed
    expect(client.queue).toHaveLength(0);
  });
});

describe("Client", function () {
  let client: Client;
  beforeEach(() => {
    jest.resetAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue("mockUUID");
    client = new Client({
      apiKey: "testApiKey",
      orgKey: "testOrgKey",
      tags: ["testTag"],
      endpoint: "testEndpoint",
      maxWaitTime: 1000,
      maxQueueSize: 100,
      patchApi: [],
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("constructor", () => {
    // Here we want to test that the constructor correctly sets the properties based on the constructor arguments and environment variables
    it("should correctly initialize properties", () => {
      expect(client).toHaveProperty("apiKey", "testApiKey");
      expect(client).toHaveProperty("orgKey", "testOrgKey");
      expect(client).toHaveProperty("endpoint", "testEndpoint");
      // ... add more assertions as necessary
    });
    // Here we want to test that the constructor calls postSession with the correct arguments
    it("should call postSession with correct arguments", () => {
      expect(postSession).toHaveBeenCalledWith(
        "testEndpoint",
        expect.any(Session),
        "testApiKey",
        "testOrgKey"
      );
    });
  });
  describe("endSession", () => {
    // Here we want to test that endSession correctly calls the necessary methods and sets properties when the session has not already ended
    it("should correctly end the session when the session has not already ended", async () => {
      (Session.prototype.hasEnded as jest.Mock).mockReturnValue(false);
      await client.endSession("testEndState", "testRating");
      expect(clearInterval).toHaveBeenCalledWith(expect.anything());
      expect(postSession).toHaveBeenCalledWith(
        "testEndpoint",
        expect.any(Session),
        "testApiKey",
        "testOrgKey"
      );
    });
    // Here we want to test that endSession does not call the necessary methods and does not set properties when the session has already ended
    it("should not end the session when the session has already ended", async () => {
      (Session.prototype.hasEnded as jest.Mock).mockReturnValue(true);
      await client.endSession("testEndState", "testRating");
      expect(clearInterval).not.toHaveBeenCalled();
      expect(postSession).not.toHaveBeenCalled();
    });
  });
});
