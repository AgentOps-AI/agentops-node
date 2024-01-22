import { Session } from "./session";

// We are testing the Session class
describe("Session", function () {
  // Reset all mocks before each test and restore them afterwards
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Test the constructor
  describe("constructor", () => {
    it("should initialize the session with the given id and tags", () => {
      const id = "session-id";
      const tags = ["tag1", "tag2"];
      const session = new Session(id, tags);
      expect(session.sessionId).toEqual(id);
      expect(session.tags).toEqual(tags);
      expect(session.initTimestamp).toBeDefined();
    });
    it("should initialize the session with empty tags if not provided", () => {
      const id = "session-id";
      const session = new Session(id);
      expect(session.sessionId).toEqual(id);
      expect(session.tags).toEqual([]);
      expect(session.initTimestamp).toBeDefined();
    });
  });
  // Test the endSession method
  describe("endSession", () => {
    it("should set the end state and rating of the session after session is ended", () => {
      const id = "session-id";
      const endState = "Success";
      const rating = "5";
      const session = new Session(id);
      session.endSession(endState, rating);
      expect(session.endState).toEqual(endState);
      expect(session.rating).toEqual(rating);
      expect(session.endTimestamp).toBeDefined();
    });
    it("should set the end state as indeterminate and default rating if not provided", () => {
      const id = "session-id";
      const endState = "Indeterminate";
      const session = new Session(id);
      expect(session.endState).toEqual(endState);
      expect(session.rating).toEqual(undefined);
      expect(session.endTimestamp).toBeDefined();
    });
  });
});

// We use Jest's describe function to group our tests together
describe("Session", function () {
  let session: Session;
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    session = new Session("1234");
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Testing the constructor of the Session class
  it("should create a new session with the provided id and an empty tag array", () => {
    expect(session.sessionId).toBe("1234");
    expect(session.tags).toEqual([]);
  });
  // Testing the hasEnded method of the Session class
  describe("hasEnded", () => {
    it("should return false if the session has not ended", () => {
      // Mocking the endState property of the session to be Indeterminate
      session.endState = "Indeterminate";
      expect(session.hasEnded()).toBe(false);
    });
    it("should return true if the session has ended", () => {
      // Mocking the endState property of the session to be a non-null value
      session.endState = "Success";
      expect(session.hasEnded()).toBe(true);
    });
  });
});
