import { computeSportSet, type SanitizedActivity } from "./strava";

export type WeekCategory = {
  label: string;
  color: "gold" | "purple" | "green" | "red" | "secondary";
  description: string;
};

/** current weekly goal, adapt as needed */
const weeklyGoal = { run: 3, lift: 3 };
const weeklyGoalDescription = `${weeklyGoal.run}+ ${pluralize(weeklyGoal.run, "run")} and ${weeklyGoal.lift}+ ${pluralize(weeklyGoal.lift, "lift")}`;

function pluralize(count: number, word: string) {
  return count === 1 ? word : `${word}s`;
}

function trainedDays(count: number) {
  return `trained ${count} ${pluralize(count, "day")}`;
}

function metWeeklyGoal(activities: SanitizedActivity[]) {
  const sportSets = activities.map((activity) => computeSportSet(activity.sport_type));
  const runs = sportSets.filter((sportSet) => sportSet === "run").length;
  const lifts = sportSets.filter((sportSet) => sportSet === "lift").length;
  return runs >= weeklyGoal.run && lifts >= weeklyGoal.lift;
}

export function categorizeCurrentWeek(activities: SanitizedActivity[]): WeekCategory {
  return { label: "in progress", color: "secondary", description: `${trainedDays(activities.length)} so far` };
}

export function categorizeWeek(activities: SanitizedActivity[]): WeekCategory {
  const count = activities.length;
  const description = trainedDays(count);

  if (metWeeklyGoal(activities)) {
    return {
      label: "outstanding 🥇",
      color: "gold",
      description: `${description}. reached goal of ${weeklyGoalDescription}`,
    };
  }
  if (count >= 5) return { label: "strong", color: "purple", description };
  if (count >= 3) return { label: "good", color: "green", description };
  if (count === 2) return { label: "okay", color: "green", description };
  return { label: "slacking 😴", color: "red", description };
}
