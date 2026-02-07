import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  validatePostcode,
  validateSuburb,
  getSuburbsByPostcode,
  getPostcodesBySuburb,
  suggestPostcodes,
} from "../postcode-validator";

export const postcodeRouter = router({
  /**
   * Validate a postcode and get associated suburbs
   */
  validatePostcode: publicProcedure
    .input(z.object({ postcode: z.string() }))
    .query(({ input }) => {
      return validatePostcode(input.postcode);
    }),

  /**
   * Validate a suburb name and get associated postcodes
   */
  validateSuburb: publicProcedure
    .input(z.object({ suburb: z.string(), state: z.string().optional() }))
    .query(({ input }) => {
      return validateSuburb(input.suburb, input.state);
    }),

  /**
   * Get suburbs for a postcode
   */
  getSuburbsByPostcode: publicProcedure
    .input(z.object({ postcode: z.string() }))
    .query(({ input }) => {
      return getSuburbsByPostcode(input.postcode);
    }),

  /**
   * Get postcodes for a suburb
   */
  getPostcodesBySuburb: publicProcedure
    .input(z.object({ suburb: z.string() }))
    .query(({ input }) => {
      return getPostcodesBySuburb(input.suburb);
    }),

  /**
   * Get suggested postcodes for invalid input
   */
  suggestPostcodes: publicProcedure
    .input(z.object({ postcode: z.string() }))
    .query(({ input }) => {
      return suggestPostcodes(input.postcode);
    }),
});
