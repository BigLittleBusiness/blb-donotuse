import { describe, expect, it } from "vitest";
import {
  validatePostcode,
  validateSuburb,
  getSuburbsByPostcode,
  getPostcodesBySuburb,
  suggestPostcodes,
} from "./postcode-validator";

describe("Postcode Validator", () => {
  describe("validatePostcode", () => {
    it("should validate a valid NSW postcode", () => {
      const result = validatePostcode("2000");
      expect(result.isValid).toBe(true);
      expect(result.state).toBe("NSW");
      expect(result.suburbs).toContain("Sydney");
    });

    it("should validate a valid VIC postcode", () => {
      const result = validatePostcode("3000");
      expect(result.isValid).toBe(true);
      expect(result.state).toBe("VIC");
      expect(result.suburbs).toContain("Melbourne");
    });

    it("should validate a valid QLD postcode", () => {
      const result = validatePostcode("4000");
      expect(result.isValid).toBe(true);
      expect(result.state).toBe("QLD");
      expect(result.suburbs).toContain("Brisbane");
    });

    it("should reject invalid postcode format", () => {
      const result = validatePostcode("ABC");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject non-existent postcode", () => {
      const result = validatePostcode("9999");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should handle postcode with spaces", () => {
      const result = validatePostcode("  2000  ");
      expect(result.isValid).toBe(true);
      expect(result.postcode).toBe("2000");
    });
  });

  describe("validateSuburb", () => {
    it("should validate a valid suburb", () => {
      const result = validateSuburb("Sydney");
      expect(result.isValid).toBe(true);
      expect(result.postcodes).toContain("2000");
    });

    it("should validate suburb case-insensitively", () => {
      const result = validateSuburb("sydney");
      expect(result.isValid).toBe(true);
      expect(result.postcodes.length).toBeGreaterThan(0);
    });

    it("should filter by state if provided", () => {
      const result = validateSuburb("Melbourne", "VIC");
      expect(result.isValid).toBe(true);
      expect(result.state).toBe("VIC");
    });

    it("should reject empty suburb name", () => {
      const result = validateSuburb("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject non-existent suburb", () => {
      const result = validateSuburb("NonExistentSuburb");
      expect(result.isValid).toBe(false);
    });
  });

  describe("getSuburbsByPostcode", () => {
    it("should return suburbs for valid postcode", () => {
      const suburbs = getSuburbsByPostcode("2000");
      expect(suburbs.length).toBeGreaterThan(0);
      expect(suburbs).toContain("Sydney");
    });

    it("should return empty array for invalid postcode", () => {
      const suburbs = getSuburbsByPostcode("9999");
      expect(suburbs).toEqual([]);
    });

    it("should handle postcode with spaces", () => {
      const suburbs = getSuburbsByPostcode("  2000  ");
      expect(suburbs.length).toBeGreaterThan(0);
    });
  });

  describe("getPostcodesBySuburb", () => {
    it("should return postcodes for valid suburb", () => {
      const postcodes = getPostcodesBySuburb("Sydney");
      expect(postcodes.length).toBeGreaterThan(0);
      expect(postcodes).toContain("2000");
    });

    it("should return empty array for invalid suburb", () => {
      const postcodes = getPostcodesBySuburb("NonExistentSuburb");
      expect(postcodes).toEqual([]);
    });

    it("should handle suburb case-insensitively", () => {
      const postcodes = getPostcodesBySuburb("sydney");
      expect(postcodes.length).toBeGreaterThan(0);
    });
  });

  describe("suggestPostcodes", () => {
    it("should suggest postcodes for invalid postcode", () => {
      const suggestions = suggestPostcodes("2005");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toMatch(/^\d{4}$/);
    });

    it("should suggest nearby postcodes", () => {
      const suggestions = suggestPostcodes("2001");
      expect(suggestions.length).toBeGreaterThan(0);
      // Should be close to 2001
      suggestions.forEach((pc) => {
        const diff = Math.abs(parseInt(pc) - 2001);
        expect(diff).toBeLessThanOrEqual(100);
      });
    });

    it("should return empty array for non-numeric input", () => {
      const suggestions = suggestPostcodes("ABC");
      expect(suggestions).toEqual([]);
    });
  });

  describe("Integration tests", () => {
    it("should validate postcode and get suburbs", () => {
      const validation = validatePostcode("2000");
      expect(validation.isValid).toBe(true);

      const suburbs = getSuburbsByPostcode("2000");
      expect(suburbs).toEqual(validation.suburbs);
    });

    it("should validate suburb and get postcodes", () => {
      const validation = validateSuburb("Sydney");
      expect(validation.isValid).toBe(true);

      const postcodes = getPostcodesBySuburb("Sydney");
      expect(postcodes).toEqual(validation.postcodes);
    });

    it("should handle bidirectional suburb-postcode mapping", () => {
      const postcode = "2000";
      const suburbs = getSuburbsByPostcode(postcode);
      expect(suburbs.length).toBeGreaterThan(0);

      const suburb = suburbs[0];
      const postcodes = getPostcodesBySuburb(suburb);
      expect(postcodes).toContain(postcode);
    });
  });
});
