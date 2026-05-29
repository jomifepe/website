import { IconBrandStrava } from "@tabler/icons-react";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { SocialLink } from "~/components/SocialLink";
import { Badge } from "../components/Badge";
import { PageLayout } from "../components/PageLayout";
import { Tooltip } from "../components/Tooltip";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { WorkoutCard } from "../components/WorkoutCard";
import { getActivities } from "../lib/server-activities";
import type { StravaActivity } from "../lib/strava";

export const Route = createFileRoute("/workout")({
	// Fetch ~2 weeks of activities
	loader: async () => {
		const activities = await getActivities();
		const { current, last } = groupByCalendarWeek(activities);
		return { current, last };
	},
	headers: () => ({
		"Cache-Control":
			"public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
	}),
	staleTime: 60 * 60 * 1000,
	component: WorkoutPage,
});

function WorkoutPage() {
	const activities = useLoaderData({ from: "/workout" });

	const weeks = [
		{ label: "current week", activities: activities.current },
		{ label: "last week", activities: activities.last },
	];

	return (
		<PageLayout>
			<div className="flex shrink-0 items-center justify-between gap-3 mb-4">
				<Link
					to="/"
					className="relative z-10 flex shrink-0 items-center justify-center rounded-lg -mx-2 -my-1 px-2 py-1 text-foreground/60 hover:text-foreground focus:text-foreground hover:bg-foreground/10 focus:bg-foreground/10 transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-ring h-10"
					aria-label="back to home"
				>
					<span className="mr-2">←</span>back
				</Link>
				<SocialLink
					name="strava"
					url="https://www.strava.com/athletes/jomifepe"
					title="strava"
					hoverColor="orange"
					useSlideHighlight={false}
					icon={<IconBrandStrava size={20} className="shrink-0" aria-hidden />}
				/>
			</div>

			<section>
				<h1 className="text-foreground text-sm font-medium mb-8 tracking-wider">
					workouts
				</h1>
				<div className="flex flex-col items-stretch gap-8">
					{weeks.map(({ label, activities: weekActivities }) => {
						const category =
							label === "current week"
								? categorizeCurrentWeek(weekActivities.length)
								: categorizeWeek(weekActivities.length);
						return (
							<Card
								key={label}
								className="flex h-full flex-col gap-4 border-border bg-foreground/[0.04] p-6 text-foreground shadow-none"
							>
								<CardHeader className="p-0">
									<div className="flex flex-row flex-wrap items-center gap-3">
										<CardTitle className="font-medium tracking-wider text-sm text-foreground">
											{label}
										</CardTitle>
										<Tooltip content={category.description}>
											<Badge className="cursor-help" variant={category.color}>
												{category.label}
											</Badge>
										</Tooltip>
									</div>
								</CardHeader>
								<CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-0">
									{weekActivities.length === 0 ? (
										<p className="italic text-foreground/40 text-sm">
											no activities yet, get moving
										</p>
									) : (
										<div className="flex flex-col items-stretch gap-2">
											{weekActivities.map((activity, index) => (
												<WorkoutCard
													key={activity.id}
													activity={activity}
													isLastItemInList={index === weekActivities.length - 1}
												/>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>
		</PageLayout>
	);
}

function getWeekBounds(): { currentMonday: Date; lastMonday: Date } {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	const offsetFromMonday = (dayOfWeek - 1 + 7) % 7;

	const currentMonday = new Date(today);
	currentMonday.setHours(0, 0, 0, 0);
	currentMonday.setDate(today.getDate() - offsetFromMonday);

	const lastMonday = new Date(currentMonday);
	lastMonday.setDate(currentMonday.getDate() - 7);

	return { currentMonday, lastMonday };
}

function groupByCalendarWeek<T extends StravaActivity>(
	activities: T[],
): {
	current: T[];
	last: T[];
} {
	const { currentMonday, lastMonday } = getWeekBounds();
	const current: T[] = [];
	const last: T[] = [];

	for (const activity of activities) {
		const date = new Date(activity.start_date_local);
		if (date >= currentMonday) {
			current.push(activity);
		} else if (date >= lastMonday) {
			last.push(activity);
		}
	}

	return { current, last };
}

type WeekCategory = {
	label: string;
	color: "gold" | "purple" | "green" | "red" | "secondary";
	description: string;
};

function categorizeCurrentWeek(activityCount: number): WeekCategory {
	return {
		label: "in progress",
		color: "secondary",
		description: `trained ${activityCount} day${activityCount === 1 ? "" : "s"} so far`,
	};
}

function categorizeWeek(activityCount: number): WeekCategory {
	if (activityCount >= 6) {
		return {
			label: "outstanding 🥇",
			color: "gold",
			description: `trained 6 or more days`,
		};
	}
	if (activityCount === 5) {
		return {
			label: "strong",
			color: "purple",
			description: "trained 5 days",
		};
	}
	if (activityCount >= 3) {
		return {
			label: "good",
			color: "green",
			description: `trained ${activityCount} days`,
		};
	}
	if (activityCount === 2) {
		return {
			label: "okay",
			color: "green",
			description: "trained 2 days",
		};
	}
	return {
		label: "slacking 😴",
		color: "red",
		description: `trained ${activityCount} day${activityCount === 1 ? "" : "s"}`,
	};
}
