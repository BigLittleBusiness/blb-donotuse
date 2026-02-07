import { eq, and, inArray } from "drizzle-orm";
import { suburbs, grant_locations, user_locations, grants } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get suburb by name and return with postcode
 */
export async function getSuburbByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(suburbs)
    .where(eq(suburbs.name, name))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get suburb by postcode
 */
export async function getSuburbByPostcode(postcode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(suburbs)
    .where(eq(suburbs.postcode, postcode))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Search suburbs by name or postcode
 */
export async function searchSuburbs(query: string) {
  const db = await getDb();
  if (!db) return [];

  // Search by name or postcode
  const results = await db
    .select()
    .from(suburbs)
    .where(
      query.match(/^\d+$/)
        ? eq(suburbs.postcode, query)
        : eq(suburbs.name, query)
    )
    .limit(20);

  return results;
}

/**
 * Get all suburbs for a state
 */
export async function getSuburbsByState(state: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(suburbs)
    .where(eq(suburbs.state, state));

  return results;
}

/**
 * Add location to grant
 */
export async function addGrantLocation(grantId: number, suburbId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .insert(grant_locations)
      .values({ grant_id: grantId, suburb_id: suburbId });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add grant location:", error);
    throw error;
  }
}

/**
 * Remove location from grant
 */
export async function removeGrantLocation(grantId: number, suburbId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .delete(grant_locations)
      .where(
        and(
          eq(grant_locations.grant_id, grantId),
          eq(grant_locations.suburb_id, suburbId)
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to remove grant location:", error);
    throw error;
  }
}

/**
 * Get all locations for a grant
 */
export async function getGrantLocations(grantId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: suburbs.id,
      name: suburbs.name,
      postcode: suburbs.postcode,
      state: suburbs.state,
    })
    .from(grant_locations)
    .innerJoin(suburbs, eq(grant_locations.suburb_id, suburbs.id))
    .where(eq(grant_locations.grant_id, grantId));

  return results;
}

/**
 * Get grants available in a specific suburb
 */
export async function getGrantsBySuburb(suburbId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: grants.id,
      title: grants.title,
      description: grants.description,
      budget: grants.budget,
      status: grants.status,
      category: grants.category,
      closing_date: grants.closing_date,
    })
    .from(grant_locations)
    .innerJoin(grants, eq(grant_locations.grant_id, grants.id))
    .where(eq(grant_locations.suburb_id, suburbId));

  return results;
}

/**
 * Set user's primary location
 */
export async function setUserLocation(userId: number, suburbId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    // Remove previous primary location
    await db
      .delete(user_locations)
      .where(
        and(
          eq(user_locations.user_id, userId),
          eq(user_locations.is_primary, true)
        )
      );

    // Add new primary location
    const result = await db
      .insert(user_locations)
      .values({
        user_id: userId,
        suburb_id: suburbId,
        is_primary: true,
      });

    return result;
  } catch (error) {
    console.error("[Database] Failed to set user location:", error);
    throw error;
  }
}

/**
 * Get user's primary location
 */
export async function getUserLocation(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: suburbs.id,
      name: suburbs.name,
      postcode: suburbs.postcode,
      state: suburbs.state,
    })
    .from(user_locations)
    .innerJoin(suburbs, eq(user_locations.suburb_id, suburbs.id))
    .where(
      and(
        eq(user_locations.user_id, userId),
        eq(user_locations.is_primary, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get grants available to user's area
 */
export async function getGrantsForUserArea(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userLocation = await getUserLocation(userId);
  if (!userLocation) return [];

  const results = await db
    .select({
      id: grants.id,
      title: grants.title,
      description: grants.description,
      budget: grants.budget,
      status: grants.status,
      category: grants.category,
      closing_date: grants.closing_date,
    })
    .from(grant_locations)
    .innerJoin(grants, eq(grant_locations.grant_id, grants.id))
    .where(eq(grant_locations.suburb_id, userLocation.id));

  return results;
}

/**
 * Seed suburbs table with Australian suburbs and postcodes
 */
export async function seedSuburbs() {
  const db = await getDb();
  if (!db) return;

  // Sample Australian suburbs with postcodes
  const australianSuburbs = [
    // NSW
    { name: "Sydney", postcode: "2000", state: "NSW", latitude: -33.8688, longitude: 151.2093 },
    { name: "Parramatta", postcode: "2150", state: "NSW", latitude: -33.8115, longitude: 151.0033 },
    { name: "Newcastle", postcode: "2300", state: "NSW", latitude: -32.9271, longitude: 151.7826 },
    { name: "Wollongong", postcode: "2500", state: "NSW", latitude: -34.4268, longitude: 150.8931 },
    // VIC
    { name: "Melbourne", postcode: "3000", state: "VIC", latitude: -37.8136, longitude: 144.9631 },
    { name: "Geelong", postcode: "3220", state: "VIC", latitude: -38.1499, longitude: 144.3617 },
    { name: "Ballarat", postcode: "3350", state: "VIC", latitude: -37.5585, longitude: 143.8503 },
    // QLD
    { name: "Brisbane", postcode: "4000", state: "QLD", latitude: -27.4698, longitude: 153.0251 },
    { name: "Gold Coast", postcode: "4217", state: "QLD", latitude: -28.0028, longitude: 153.4314 },
    { name: "Cairns", postcode: "4870", state: "QLD", latitude: -16.8661, longitude: 145.7781 },
    // WA
    { name: "Perth", postcode: "6000", state: "WA", latitude: -31.9505, longitude: 115.8605 },
    { name: "Fremantle", postcode: "6160", state: "WA", latitude: -32.0521, longitude: 115.7455 },
    // SA
    { name: "Adelaide", postcode: "5000", state: "SA", latitude: -34.9285, longitude: 138.6007 },
    // TAS
    { name: "Hobart", postcode: "7000", state: "TAS", latitude: -42.8821, longitude: 147.3272 },
    // ACT
    { name: "Canberra", postcode: "2600", state: "ACT", latitude: -35.2809, longitude: 149.1300 },
    // NT
    { name: "Darwin", postcode: "0800", state: "NT", latitude: -12.4634, longitude: 130.8456 },
  ];

  try {
    for (const suburb of australianSuburbs) {
      const existing = await getSuburbByName(suburb.name);
      if (!existing) {
        await db.insert(suburbs).values({
          name: suburb.name,
          postcode: suburb.postcode,
          state: suburb.state,
          latitude: suburb.latitude,
          longitude: suburb.longitude,
        });
      }
    }
    console.log("[Database] Suburbs seeded successfully");
  } catch (error) {
    console.error("[Database] Failed to seed suburbs:", error);
  }
}
