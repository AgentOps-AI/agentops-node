import axios from "axios";
import { post, postEvents, postSession } from "./http";
import { transformKeysToSnakeCase } from "./utils";
import { Event } from "./app";
import { Session } from "./session";

jest.mock("./utils");

// Mocking external axios module
jest.mock("axios");

// Jest mock function for axios post request

describe("http", function () {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  // Setting up necessary constants for testing
  const url = "http://test.com";
  const payload = { message: "test" };
  const apiKey = "test-api-key";
  const orgKey = "test-org-key";
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("post", () => {
    it("should successfully post data", async () => {
      // Mock resolved value for axios post
      mockedAxios.post.mockResolvedValue({ data: "success" });
      const response = await post(url, payload, apiKey, orgKey);
      // Expect axios post to have been called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(url, payload, {
        headers: {
          "X-Agentops-Auth": apiKey,
          "X-Agentops-Org": orgKey,
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "*/*",
        },
      });
      // Expect response to be 'success'
      expect(response.data).toBe("success");
    });
    it("should throw error after retry limit", async () => {
      // Mock rejected value for axios post to simulate an error
      mockedAxios.post.mockRejectedValue(new Error("Network Error"));
      // Expect post function to throw an error
      await expect(post(url, payload, apiKey, orgKey)).rejects.toThrow(
        "Network Error"
      );
    });
  });
});

describe("http", function () {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("post", () => {
    it("should call axios.post with correct parameters", async () => {
      const url = "http://test.com";
      const payload = { key: "value" };
      const apiKey = "apiKey";
      const orgKey = "orgKey";
      // Mock axios.post to resolve with some data
      (axios.post as jest.Mock).mockResolvedValue("data");
      await post(url, payload, apiKey, orgKey);
      expect(axios.post).toHaveBeenCalledWith(url, payload, {
        headers: {
          "X-Agentops-Auth": apiKey,
          "X-Agentops-Org": orgKey,
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "*/*",
        },
      });
    });
  });
  describe("postEvents", () => {
    it("should call post with correct parameters", async () => {
      const endpoint = "http://test.com";
      const events = [{ id: "1" }];
      const apiKey = "apiKey";
      const orgKey = "orgKey";
      const transformedEvents = [{ id_snake_case: "1" }];
      // Mock transformKeysToSnakeCase to return transformedEvents
      (transformKeysToSnakeCase as jest.Mock).mockReturnValue(
        transformedEvents
      );
      // Mock post to resolve with some data
      (post as jest.Mock).mockResolvedValue("data");
      await postEvents(endpoint, events, apiKey, orgKey);
      expect(transformKeysToSnakeCase).toHaveBeenCalledWith(events);
      expect(post).toHaveBeenCalledWith(
        `${endpoint}/events`,
        { events: transformedEvents },
        apiKey,
        orgKey
      );
    });
  });
});

// Mocking external axios module
// Mocking external axios module
// This test suite is for http.ts
describe("http.ts tests", function () {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Test for post function
  it("should test the post function", async () => {
    // Arrange
    const url = "http://example.com";
    const payload = {};
    const apiKey = "test";
    const orgKey = "orgKey";
    const response = { data: {} };
    (axios.post as jest.Mock).mockResolvedValue(response);
    // Act
    const result = await post(url, payload, apiKey, orgKey);
    // Assert
    expect(axios.post).toBeCalledWith(url, payload, {
      headers: {
        "X-Agentops-Auth": apiKey,
        "X-Agentops-Org": orgKey,
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "*/*",
      },
    });
    expect(result).toBe(response);
  });
  // Test for postSession function
  it("should test the postSession function", async () => {
    // Arrange
    const endpoint = "http://example.com";
    const session: Session = {
      /* Session object */
    };
    const apiKey = "test";
    const orgKey = "orgKey";
    const response = { data: {} };
    (axios.post as jest.Mock).mockResolvedValue(response);
    // Act
    const result = await postSession(endpoint, session, apiKey, orgKey);
    // Assert
    expect(axios.post).toBeCalledWith(
      `${endpoint}/sessions`,
      { session: transformKeysToSnakeCase(session) },
      apiKey,
      orgKey
    );
    expect(result).toBe(response);
  });
});
