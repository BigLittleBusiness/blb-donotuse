import { eq, and, inArray } from "drizzle-orm";
import { suburbs, grant_locations, user_locations, grants, location_notifications, location_notification_preferences } from "../drizzle/schema";
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
          latitude: suburb.latitude.toString(),
          longitude: suburb.longitude.toString(),
        });
      }
    }
    console.log("[Database] Suburbs seeded successfully");
  } catch (error) {
    console.error("[Database] Failed to seed suburbs:", error);
  }
}


/**
 * Get nearby suburbs within a specified radius (in km)
 * Uses simple distance calculation based on latitude/longitude
 */
export async function getNearbySuburbs(suburbId: number, radiusKm: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Get the center suburb's coordinates
  const centerSuburb = await db
    .select()
    .from(suburbs)
    .where(eq(suburbs.id, suburbId))
    .limit(1);

  if (!centerSuburb || centerSuburb.length === 0) return [];

  const center = centerSuburb[0];
  if (!center.latitude || !center.longitude) return [];

  // Get all suburbs and filter by distance
  const allSuburbs = await db.select().from(suburbs);
  
  const nearby = allSuburbs.filter((suburb) => {
    if (!suburb.latitude || !suburb.longitude) return false;
    
    // Simple distance calculation (Haversine formula approximation)
    const lat1 = parseFloat(center.latitude || "0");
    const lon1 = parseFloat(center.longitude || "0");
    const lat2 = parseFloat(suburb.latitude || "0");
    const lon2 = parseFloat(suburb.longitude || "0");
    
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance <= radiusKm && distance > 0; // Exclude the center suburb itself
  });

  return nearby;
}

/**
 * Create location notification for a user when a grant is added to their area
 */
export async function createLocationNotification(
  userId: number,
  suburbId: number,
  grantId: number,
  notificationType: "new_grant" | "grant_updated" | "application_deadline_reminder" | "grant_awarded" = "new_grant"
) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.insert(location_notifications).values({
      user_id: userId,
      suburb_id: suburbId,
      grant_id: grantId,
      notification_type: notificationType,
      is_sent: false,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create location notification:", error);
    return undefined;
  }
}

/**
 * Get unsent location notifications for a user
 */
export async function getUnsentNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(location_notifications)
    .where(
      and(
        eq(location_notifications.user_id, userId),
        eq(location_notifications.is_sent, false)
      )
    );

  return result;
}

/**
 * Mark notification as sent
 */
export async function markNotificationAsSent(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .update(location_notifications)
      .set({
        is_sent: true,
        sent_at: new Date(),
      })
      .where(eq(location_notifications.id, notificationId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to mark notification as sent:", error);
    return undefined;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .update(location_notifications)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(eq(location_notifications.id, notificationId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    return undefined;
  }
}

/**
 * Get user's location notification preferences
 */
export async function getLocationNotificationPreferences(userId: number, suburbId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(location_notification_preferences)
    .where(
      and(
        eq(location_notification_preferences.user_id, userId),
        eq(location_notification_preferences.suburb_id, suburbId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create or update location notification preferences
 */
export async function upsertLocationNotificationPreferences(
  userId: number,
  suburbId: number,
  preferences: {
    notify_new_grants?: boolean;
    notify_grant_updates?: boolean;
    notify_nearby_areas?: boolean;
    nearby_radius_km?: number;
    notification_frequency?: "immediate" | "daily" | "weekly" | "never";
  }
) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const existing = await getLocationNotificationPreferences(userId, suburbId);

    if (existing) {
      const result = await db
        .update(location_notification_preferences)
        .set({
          notify_new_grants: preferences.notify_new_grants ?? existing.notify_new_grants,
          notify_grant_updates: preferences.notify_grant_updates ?? existing.notify_grant_updates,
          notify_nearby_areas: preferences.notify_nearby_areas ?? existing.notify_nearby_areas,
          nearby_radius_km: preferences.nearby_radius_km ?? existing.nearby_radius_km,
          notification_frequency: preferences.notification_frequency ?? existing.notification_frequency,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(location_notification_preferences.user_id, userId),
            eq(location_notification_preferences.suburb_id, suburbId)
          )
        );
      return result;
    } else {
      const result = await db.insert(location_notification_preferences).values({
        user_id: userId,
        suburb_id: suburbId,
        notify_new_grants: preferences.notify_new_grants ?? true,
        notify_grant_updates: preferences.notify_grant_updates ?? true,
        notify_nearby_areas: preferences.notify_nearby_areas ?? false,
        nearby_radius_km: preferences.nearby_radius_km ?? 10,
        notification_frequency: preferences.notification_frequency ?? "immediate",
      });
      return result;
    }
  } catch (error) {
    console.error("[Database] Failed to upsert location notification preferences:", error);
    return undefined;
  }
}

/**
 * Find all users to notify when a grant is added to a location
 */
export async function getUsersToNotifyForGrant(grantId: number, suburbIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all users with locations in the grant's suburbs
    const usersWithLocations = await db
      .select({
        user_id: user_locations.user_id,
        suburb_id: user_locations.suburb_id,
      })
      .from(user_locations)
      .where(inArray(user_locations.suburb_id, suburbIds));

    // Filter by notification preferences
    const usersToNotify = [];
    for (const userLocation of usersWithLocations) {
      const prefs = await getLocationNotificationPreferences(
        userLocation.user_id,
        userLocation.suburb_id
      );

      // If no preferences exist, use defaults (notify)
      if (!prefs || prefs.notify_new_grants) {
        usersToNotify.push({
          userId: userLocation.user_id,
          suburbId: userLocation.suburb_id,
        });
      }
    }

    return usersToNotify;
  } catch (error) {
    console.error("[Database] Failed to get users to notify:", error);
    return [];
  }
}


