import { get, put } from "@vercel/blob";
import { z } from "zod";
import {
  extractRunBestEfforts,
  reduceAllTimeBestEfforts,
  type AllTimeBestEfforts,
} from "./best-efforts";
import {
  computeSportSet,
  fetchActivityDetailRaw,
  fetchActivitiesRaw,
  fetchAllPublicActivities,
  sanitizeActivity,
  sanitizeActivityDetail,
  type SanitizedActivity,
  type SanitizedActivityDetail,
  type SportType,
  type StravaActivity,
} from "./strava";

const WORKOUTS_BLOB_PATH = "workouts.json";
const DETAIL_BUDGET_PER_RUN = 40;

const SanitizedActivitySchema = z.object({
  slug: z.string(),
  startDate: z.string(),
  sport_type: z.string(),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  dateDisplay: z.string(),
  dateDisplayShort: z.string(),
  title: z.string(),
  moving_time: z.number(),
  elapsed_time: z.number().optional(),
  distance: z.number(),
  total_elevation_gain: z.number(),
  routeSvgPaths: z
    .object({
      card: z.string(),
      dialog: z.string(),
    })
    .nullable(),
  has_heartrate: z.boolean().optional(),
  average_heartrate: z.number().optional(),
  max_heartrate: z.number().optional(),
  average_speed: z.number().optional(),
  average_cadence: z.number().optional(),
  pr_count: z.number().optional(),
  suffer_score: z.number().optional(),
  kilojoules: z.number().optional(),
  average_watts: z.number().optional(),
  max_watts: z.number().optional(),
  weighted_average_watts: z.number().optional(),
  device_watts: z.boolean().optional(),
});

const StoredActivitySchema = SanitizedActivitySchema.extend({
  stravaId: z.number(),
  calories: z.number().optional(),
  runBestEfforts: z.record(z.string(), z.number()).optional(),
});

const WorkoutsDocumentSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  backfillComplete: z.boolean(),
  activities: z.array(StoredActivitySchema),
});

export type StoredActivity = z.infer<typeof StoredActivitySchema>;
type WorkoutsDocument = z.infer<typeof WorkoutsDocumentSchema>;

export type WorkoutsLoaderData = {
  activities: SanitizedActivity[];
  bestEfforts: AllTimeBestEfforts | null;
};

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function emptyDocument(): WorkoutsDocument {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    backfillComplete: false,
    activities: [],
  };
}

export async function readWorkoutsDocument(): Promise<WorkoutsDocument | null> {
  if (!blobConfigured()) return null;

  const result = await get(WORKOUTS_BLOB_PATH, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;

  const text = await new Response(result.stream).text();
  return WorkoutsDocumentSchema.parse(JSON.parse(text));
}

async function writeWorkoutsDocument(doc: WorkoutsDocument) {
  if (!blobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  await put(WORKOUTS_BLOB_PATH, JSON.stringify(doc), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function storedFromListActivity(activity: StravaActivity, existing?: StoredActivity): StoredActivity {
  const sanitized = sanitizeActivity(activity);
  return {
    ...sanitized,
    sport_type: sanitized.sport_type as SportType,
    stravaId: activity.id,
    calories: existing?.calories,
    runBestEfforts: existing?.runBestEfforts,
  };
}

function isRunActivity(activity: StoredActivity | StravaActivity) {
  const sportType = "sport_type" in activity ? activity.sport_type : activity.sport_type;
  return computeSportSet(sportType as SportType) === "run";
}

function needsDetailFetch(stored: StoredActivity, summary: StravaActivity, previous?: StoredActivity) {
  if (!isRunActivity(stored)) return false;
  if (stored.runBestEfforts === undefined) return true;
  if (!previous) return true;
  if (previous.distance !== summary.distance || previous.moving_time !== summary.moving_time) return true;
  return false;
}

function computeBackfillComplete(activities: StoredActivity[]) {
  return activities.every((activity) => !isRunActivity(activity) || activity.runBestEfforts !== undefined);
}

async function applyDetailBudget(activities: StoredActivity[], ids: number[]) {
  const uniqueIds = [...new Set(ids)].slice(0, DETAIL_BUDGET_PER_RUN);

  for (const id of uniqueIds) {
    const index = activities.findIndex((activity) => activity.stravaId === id);
    if (index === -1) continue;

    const stored = activities[index];
    const detail = await fetchActivityDetailRaw(id);
    const sanitizedDetail = sanitizeActivityDetail(detail);
    const runBestEfforts = isRunActivity(stored) ? extractRunBestEfforts(detail.best_efforts) : undefined;

    activities[index] = {
      ...sanitizedDetail,
      stravaId: id,
      calories: detail.calories,
      runBestEfforts: runBestEfforts ?? (isRunActivity(stored) ? {} : undefined),
    };
  }
}

export async function syncWorkoutsStore() {
  const summaries = await fetchAllPublicActivities();
  const existingDoc = (await readWorkoutsDocument()) ?? emptyDocument();
  const existingById = new Map(existingDoc.activities.map((activity) => [activity.stravaId, activity]));

  const detailQueue: number[] = [];
  const merged: StoredActivity[] = [];

  for (const summary of summaries) {
    const previous = existingById.get(summary.id);
    const stored = storedFromListActivity(summary, previous);
    merged.push(stored);

    if (needsDetailFetch(stored, summary, previous)) {
      detailQueue.push(summary.id);
    }
  }

  merged.sort((a, b) => b.startDate.localeCompare(a.startDate) || b.slug.localeCompare(a.slug));

  await applyDetailBudget(merged, detailQueue);

  const doc: WorkoutsDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    backfillComplete: computeBackfillComplete(merged),
    activities: merged,
  };

  await writeWorkoutsDocument(doc);
  return doc;
}

/** First visit before nightly sync: one Strava page so the site is not empty. */
export async function seedWorkoutsStoreFromOnePage() {
  const summaries = await fetchActivitiesRaw(1, 28);
  const activities = summaries.map((summary) => storedFromListActivity(summary));

  const doc: WorkoutsDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    backfillComplete: false,
    activities,
  };

  await writeWorkoutsDocument(doc);
  return doc;
}

function toClientActivity(stored: StoredActivity): SanitizedActivity {
  const { stravaId: _id, calories: _calories, runBestEfforts: _efforts, ...activity } = stored;
  return {
    ...activity,
    sport_type: activity.sport_type as SportType,
  };
}

export function documentToLoaderData(doc: WorkoutsDocument): WorkoutsLoaderData {
  const activities = doc.activities.map(toClientActivity);
  const bestEfforts = doc.backfillComplete ? reduceAllTimeBestEfforts(doc.activities) : null;
  return { activities, bestEfforts };
}

export async function loadWorkoutsForSite(): Promise<WorkoutsLoaderData> {
  if (!blobConfigured()) {
    return loadWorkoutsLiveFallback();
  }

  let doc = await readWorkoutsDocument();
  if (!doc || doc.activities.length === 0) {
    doc = await seedWorkoutsStoreFromOnePage();
  }

  return documentToLoaderData(doc);
}

async function loadWorkoutsLiveFallback(): Promise<WorkoutsLoaderData> {
  const raw = await fetchActivitiesRaw(1, 28);
  return {
    activities: raw.map(sanitizeActivity),
    bestEfforts: null,
  };
}

export async function findStoredActivityBySlug(slug: string): Promise<StoredActivity | undefined> {
  const doc = await readWorkoutsDocument();
  return doc?.activities.find((activity) => activity.slug === slug);
}

export function storedToActivityDetail(stored: StoredActivity): SanitizedActivityDetail {
  const { stravaId: _id, runBestEfforts: _efforts, ...rest } = stored;
  return {
    ...rest,
    sport_type: rest.sport_type as SportType,
    calories: stored.calories ?? null,
  };
}

export async function loadActivityDetailBySlug(slug: string): Promise<SanitizedActivityDetail> {
  if (blobConfigured()) {
    const stored = await findStoredActivityBySlug(slug);
    if (stored) {
      if (stored.calories !== undefined) {
        return storedToActivityDetail(stored);
      }
      const detail = await fetchActivityDetailRaw(stored.stravaId);
      return sanitizeActivityDetail(detail);
    }
  }

  const raw = await fetchActivitiesRaw(1, 28);
  const match = raw.find((activity) => sanitizeActivity(activity).slug === slug);
  if (!match) throw new Error(`Activity not found: ${slug}`);

  const detail = await fetchActivityDetailRaw(match.id);
  return sanitizeActivityDetail(detail);
}
