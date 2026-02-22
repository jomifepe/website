import {
	IconActivity,
	IconBarbell,
	IconBike,
	IconMountain,
	IconRun,
	IconSwimming,
	IconWalk,
} from "@tabler/icons-react";
import type { SportType, StravaActivity } from "../lib/strava";

export function WorkoutCard({ activity }: { activity: StravaActivity }) {
	const date = new Date(activity.start_date_local);
	const hour = date.getHours();

	let timeOfDay: string;
	if (hour < 12) {
		timeOfDay = "morning";
	} else if (hour < 17) {
		timeOfDay = "afternoon";
	} else {
		timeOfDay = "evening";
	}

	const title = `${timeOfDay} ${getSportTypeLabel(activity.sport_type)}`;

	const dateStr = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const distanceKm = activity.distance / 1000;
	const showDistance = shouldShowDistance(activity.sport_type);

	const hours = Math.floor(activity.moving_time / 3600);
	const minutes = Math.floor((activity.moving_time % 3600) / 60);
	const seconds = activity.moving_time % 60;

	let timeStr: string;
	if (hours > 0) {
		timeStr = `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		timeStr = `${minutes}m ${seconds}s`;
	} else {
		timeStr = `${seconds}s`;
	}

	return (
		<div className="flex items-start gap-4 p-3 -mx-3 rounded-lg relative">
			<div className="text-white/60 mt-0.5">
				{getWorkoutIcon(activity.sport_type)}
			</div>
			<div className="flex-1">
				<div className="flex flex-row items-baseline gap-2 mb-1 flex-wrap">
					<span className="text-white font-medium">{title}</span>
					<span className="text-white/60">·</span>
					<span className="text-white/80 text-sm">{dateStr}</span>
				</div>
				<div className="flex items-center gap-3 text-white/60 text-sm flex-wrap">
					<span>{timeStr}</span>
					{showDistance && <span>·</span>}
					{showDistance && <span>{distanceKm.toFixed(1)} km</span>}
					{activity.total_elevation_gain > 0 && (
						<>
							<span>·</span>
							<span>↑ {Math.round(activity.total_elevation_gain)}m</span>
						</>
					)}
				</div>
			</div>
			{activity.map?.summary_polyline && (
				<RoutePreview encoded={activity.map.summary_polyline} />
			)}
		</div>
	);
}

function getSportTypeLabel(sportType: SportType) {
	return sportType
		.replace(/([A-Z])/g, " $1")
		.trim()
		.toLowerCase();
}

function RoutePreview({ encoded }: { encoded: string }) {
	if (!encoded) return null;

	const coords = decodePolyline(encoded);
	if (coords.length === 0) return null;

	const pathD = polylineToSvgPath(coords, 100, 100, 5);

	return (
		<div className="absolute top-1/2 -translate-y-1/2 right-3">
			<svg
				viewBox="0 0 100 100"
				className="w-32 h-32"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d={pathD}
					stroke="currentColor"
					strokeWidth="1.5"
					fill="none"
					vectorEffect="non-scaling-stroke"
					className="text-orange-500/30"
				/>
				<title>route preview</title>
			</svg>
		</div>
	);
}

export function getWorkoutIcon(sportType: SportType) {
	const commonProps = { size: 24, className: "shrink-0", color: "white" };

	switch (sportType) {
		case "Run":
		case "TrailRun":
		case "VirtualRun":
			return <IconRun {...commonProps} />;
		case "Walk":
			return <IconWalk {...commonProps} />;
		case "Hike":
		case "BackcountrySki":
		case "NordicSki":
		case "RollerSki":
		case "Snowshoe":
			return <IconMountain {...commonProps} />;
		case "Ride":
		case "EBikeRide":
		case "EMountainBikeRide":
		case "MountainBikeRide":
		case "GravelRide":
		case "VirtualRide":
		case "Velomobile":
		case "Handcycle":
			return <IconBike {...commonProps} />;
		case "Swim":
			return <IconSwimming {...commonProps} />;
		case "WeightTraining":
			return <IconBarbell strokeWidth={1.5} {...commonProps} />;
		case "RockClimbing":
			return <BoulderingIcon />;
		default:
			return <IconActivity {...commonProps} />;
	}
}

function BoulderingIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="currentColor"
			viewBox="0 0 64 64"
		>
			<path d="M32.104 41.533c-.567.209-1.201.33-1.85.33a7.357 7.357 0 0 1-2.017-.263l-7.169 16.474c-.654 1.519-2.456 2.032-4.03 1.148-1.565-.884-2.308-2.821-1.633-4.34l8.789-20.152h11.204v-1.883l5.67-2.639c1.485-.722 3.415.513 3.806 2.086l2.781 11.149a2.94 2.94 0 0 1-2.146 3.57 2.951 2.951 0 0 1-3.584-2.146l-1.769-7.107-8.052 3.773ZM37.268 29.985C49.545 23.898 54.304 3.044 54.304 1.302h-1.688c-.634 4.347-5.906 21.752-15.348 26.8v1.883Z" />
			<path d="M14.616 25.423a2.528 2.528 0 0 0 3.084.979l6.494-2.545v9.003h11.204V22.433L45.44 6.364a2.528 2.528 0 0 0-.79-3.482c-1.174-.736-2.726-.392-3.388.756L32.732 17.29l-5.137.013c-.33 0-.661.054-.992.182l-8.876 3.483-4.576-6.931a2.53 2.53 0 0 0-3.483-.756 2.537 2.537 0 0 0-.762 3.496l5.71 8.645Z" />
			<path d="M29.026 16.38c2.47 0 4.475-1.991 4.475-4.455a4.475 4.475 0 0 0-4.475-4.467 4.473 4.473 0 0 0-4.468 4.467 4.462 4.462 0 0 0 4.468 4.455ZM35.398 61.962V41.863l-1.883.878v19.22h1.883Z" />
			<title>Bouldering</title>
		</svg>
	);
}

function shouldShowDistance(sportType: SportType) {
	switch (sportType) {
		case "Run":
		case "TrailRun":
		case "Walk":
		case "Hike":
		case "Ride":
		case "EBikeRide":
		case "EMountainBikeRide":
		case "MountainBikeRide":
		case "GravelRide":
		case "VirtualRide":
		case "Velomobile":
		case "Handcycle":
		case "Wheelchair":
		case "Swim":
		case "Kayaking":
		case "Canoeing":
		case "StandUpPaddling":
		case "Rowing":
		case "VirtualRow":
		case "Surfing":
		case "Windsurf":
		case "Kitesurf":
		case "Sail":
			return true;
		default:
			return false;
	}
}

// Decode Google Encoded Polyline Algorithm
function decodePolyline(encoded: string): [number, number][] {
	const coords: [number, number][] = [];
	let lat = 0,
		lng = 0;
	let i = 0;

	while (i < encoded.length) {
		let dlat = 0,
			shift = 0,
			result = 0;

		do {
			const byte = encoded.charCodeAt(i++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (encoded.charCodeAt(i - 1) - 63 >= 0x20);

		dlat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += dlat;

		let dlng = 0;
		shift = 0;
		result = 0;

		do {
			const byte = encoded.charCodeAt(i++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (encoded.charCodeAt(i - 1) - 63 >= 0x20);

		dlng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += dlng;

		coords.push([lat / 1e5, lng / 1e5]);
	}

	return coords;
}

// Project coordinates to SVG path string
function polylineToSvgPath(
	coords: [number, number][],
	w: number,
	h: number,
	padding: number,
): string {
	if (coords.length === 0) return "";

	const lats = coords.map((c) => c[0]);
	const lngs = coords.map((c) => c[1]);

	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);

	const latRange = maxLat - minLat || 1;
	const lngRange = maxLng - minLng || 1;

	const innerW = w - 2 * padding;
	const innerH = h - 2 * padding;

	const points = coords.map((c) => {
		const x = padding + ((c[1] - minLng) / lngRange) * innerW;
		const y = padding + ((maxLat - c[0]) / latRange) * innerH;
		return `${x},${y}`;
	});

	return `M${points.join(" L")}`;
}
