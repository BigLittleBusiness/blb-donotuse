import { eq, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { saved_filters, InsertSavedFilter, SavedFilter } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new saved filter
 */
export async function createSavedFilter(filter: InsertSavedFilter): Promise<SavedFilter | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(saved_filters).values(filter);
    const id = result[0];
    if (id) {
      const created = await db.select().from(saved_filters).where(eq(saved_filters.id, Number(id))).limit(1);
      return created[0] || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to create saved filter:", error);
    throw error;
  }
}

/**
 * Get all saved filters for a user
 */
export async function getSavedFiltersByUserId(userId: number): Promise<SavedFilter[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(saved_filters)
      .where(
        or(
          eq(saved_filters.user_id, userId),
          eq(saved_filters.is_public, true)
        )
      )
      .orderBy(saved_filters.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get saved filters:", error);
    return [];
  }
}

/**
 * Get a specific saved filter by ID
 */
export async function getSavedFilterById(id: number): Promise<SavedFilter | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(saved_filters).where(eq(saved_filters.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get saved filter:", error);
    return null;
  }
}

/**
 * Update a saved filter
 */
export async function updateSavedFilter(id: number, updates: Partial<InsertSavedFilter>): Promise<SavedFilter | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(saved_filters).set(updates).where(eq(saved_filters.id, id));
    return getSavedFilterById(id);
  } catch (error) {
    console.error("[Database] Failed to update saved filter:", error);
    throw error;
  }
}

/**
 * Delete a saved filter
 */
export async function deleteSavedFilter(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(saved_filters).where(eq(saved_filters.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete saved filter:", error);
    return false;
  }
}

/**
 * Get all public/preset filters
 */
export async function getPublicFilters(): Promise<SavedFilter[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(saved_filters)
      .where(or(eq(saved_filters.is_public, true), eq(saved_filters.is_preset, true)))
      .orderBy(saved_filters.name);
  } catch (error) {
    console.error("[Database] Failed to get public filters:", error);
    return [];
  }
}

/**
 * Increment filter usage count
 */
export async function incrementFilterUsage(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const filter = await getSavedFilterById(id);
    if (!filter) return false;
    
    await db
      .update(saved_filters)
      .set({ usage_count: (filter.usage_count || 0) + 1 })
      .where(eq(saved_filters.id, id));
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment filter usage:", error);
    return false;
  }
}

/**
 * Get most used filters
 */
export async function getMostUsedFilters(limit: number = 10): Promise<SavedFilter[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(saved_filters)
      .orderBy(saved_filters.usage_count)
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get most used filters:", error);
    return [];
  }
}
