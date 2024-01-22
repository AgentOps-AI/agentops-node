import { toSnakeCase, transformKeysToSnakeCase } from "./utils";

// Jest provides a way to structure your tests: 'describe' and 'it'.
// 'describe' is used to group together similar tests.
describe("toSnakeCase", function () {
  // Using Jest's mock functionality to clear all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Using Jest's mock functionality to restore all mocks after each test
  afterAll(() => {
    jest.restoreAllMocks();
  });
  // 'it' is used for individual test cases within the test group.
  // Testing whether the conversion from camel case to snake case is correct.
  it("should convert string to snake case", () => {
    expect(toSnakeCase("testString")).toBe("test_string");
    expect(toSnakeCase("anotherTestString")).toBe("another_test_string");
  });
  // Testing whether the original string is not modified
  it("should not modify the original string", () => {
    const originalString = "testString";
    toSnakeCase(originalString);
    expect(originalString).toBe("testString");
  });
  // Testing edge case: When an empty string is input, the output should also be an empty string.
  it("should return empty string if input is empty string", () => {
    expect(toSnakeCase("")).toBe("");
  });
  // Testing edge case: When string with no uppercase letters is input, the output should be the same as the input.
  it("should return same string if input has no uppercase letters", () => {
    expect(toSnakeCase("teststring")).toBe("teststring");
  });
});

// We are describing a test suite for the utilities defined in utils.ts file
describe("utils", function () {
  // Resetting all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restoring all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Describing a test for toSnakeCase function
  describe("toSnakeCase", () => {
    // We want to test whether the function correctly converts camelCase strings to snake_case
    it("should convert string to snake case", () => {
      // Input for the test
      const input = "camelCaseString";
      // Expected output
      const expectedOutput = "camel_case_string";
      // Actual output from the function
      const actualOutput = toSnakeCase(input);
      // Expecting the actual output to be equal to expected output
      expect(actualOutput).toBe(expectedOutput);
    });
  });
  // Describing a test for transformKeysToSnakeCase function
  describe("transformKeysToSnakeCase", () => {
    // We want to test whether the function correctly converts object keys from camelCase to snake_case
    it("should convert object keys to snake case", () => {
      // Input for the test
      const input = {
        camelCaseKey: "value",
        anotherCamelCaseKey: "another value",
      };
      // Expected output
      const expectedOutput = {
        camel_case_key: "value",
        another_camel_case_key: "another value",
      };
      // Actual output from the function
      const actualOutput = transformKeysToSnakeCase(input);
      // Expecting the actual output to be equal to expected output
      expect(actualOutput).toEqual(expectedOutput);
    });
  });
});
