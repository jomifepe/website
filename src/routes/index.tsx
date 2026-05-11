import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandMedium,
	IconBrandStrava,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import {
	createContext,
	type FocusEvent,
	type FocusEventHandler,
	forwardRef,
	type MouseEvent,
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/cn";
import { PageLayout } from "../components/PageLayout";
import { WorkoutCard } from "../components/WorkoutCard";
import { getActivities } from "../lib/server-activities";

const codingPhrases = [
	"fabricates contraptions",
	"engineers automata",
	"forges apparatus",
	"contrives mechanisms",
	"devises contraptions",
	"assembles artifice",
	"fashions instruments",
	"conjures systems",
	"erects frameworks",
	"architects constructs",
	"spawns machinery",
	"compiles apparatuses",
	"weaves schematics",
	"begets automata",
	"sculpts algorithms",
	"marshals programs",
	"broods schemata",
	"extrudes software",
	"distills routines",
	"incubates scripts",
] as const;

const weightLiftingPhrases = [
	"heaving steel",
	"hoisting iron",
	"shouldering ballast",
	"bearing ponderances",
	"wrangling tonnage",
	"lugging heftiness",
	"pressing burdens",
	"hoisting gravitas",
	"hoicking cumbrous weight",
	"hefting mass",
	"straining neath heft",
	"shouldering preponderance",
	"heaving prodigious bulk",
	"hoisting prodigious weight",
	"subduing leaden mass",
	"grappling with enormity",
	"oppressing muscles neath load",
	"hoisting avoirdupois",
	"cleaving to burdens",
	"laboring neath tonnage",
] as const;

const runningPhrases = [
	"nimble-limbed bolting",
	"swift perambulating",
	"hasted ambulating",
	"rapid locomoting",
	"brisk coursing",
	"hasty gallivanting",
	"nimble careening",
	"fleet-limbed traversing",
	"swift peregrinating",
	"rapid sallying",
	"vehement dashing",
	"frantic scurrying",
	"unfettered bolting",
	"tempestuous galloping",
	"pellmell scampering",
	"expeditious trotting",
	"breakneck hurtling",
	"precipitous dashing",
	"headlong careering",
	"frenetic bolting",
] as const;

const musicPhrases = [
	"reveling in cacophony",
	"indulging thunderous din",
	"luxuriating in clamor",
	"wallowing in tumult",
	"steeping in discord",
	"bathing in resonance",
	"imbibing vehement sonance",
	"communing with clamour",
	"soaking in uproar",
	"feasting on pandemonium",
	"luxuriating in dissonance",
	"reveling in stridency",
	"surrendering to cacophony",
	"marinating in sonorous din",
	"drowning in clangor",
	"yielding to thunderclaps",
	"beholding sonorous bedlam",
	"submerging in clangor",
	"enshrouding in noise",
	"steeping in strident rumble",
] as const;

function rnd(array: readonly string[]) {
	return array[Math.floor(Math.random() * array.length)];
}

export const Route = createFileRoute("/")({
	loader: async () => ({
		recentWorkouts: await getActivities({ data: { page: 1, perPage: 2 } }),
		sentences: {
			codingSentence: rnd(codingPhrases),
			weightLiftingSentence: rnd(weightLiftingPhrases),
			runningSentence: rnd(runningPhrases),
			musicSentence: rnd(musicPhrases),
		},
	}),
	headers: () => ({
		"Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
	}),
	component: App,
});

function App() {
	const { recentWorkouts, sentences } = useLoaderData({ from: "/" });

	return (
		<PageLayout>
			<h1 className="sr-only">josé pereira - software engineer</h1>
			<p className="text-white">
				<strong>josé pereira</strong> is a{" "}
				<span className="underline underline-offset-4 decoration-dotted">
					software engineer
				</span>
			</p>
			<div className="flex flex-col gap-1 mt-3">
				<p className="relative text-white/50 text-sm">
					<span
						className="absolute -left-4 top-0 font-bold flex justify-center font-mono text-green-500 tabular-nums animate-terminal-cursor motion-reduce:animate-none motion-reduce:opacity-100 select-none"
						aria-hidden="true"
					>
						_
					</span>
					he{" "}
					<TextLink to="https://github.com/jomifepe" hoverColor="purple">
						{sentences.codingSentence}
					</TextLink>{" "}
					on his computer, enjoys{" "}
					<TextLink to="/workout" hoverColor="orange">
						{sentences.weightLiftingSentence}
					</TextLink>{" "}
					and{" "}
					<TextLink to="/workout" hoverColor="orange">
						{sentences.runningSentence}
					</TextLink>
					, as well as{" "}
					<TextLink to="https://stats.fm/jomifepe" hoverColor="green">
						{sentences.musicSentence}
					</TextLink>
					.
				</p>
			</div>
			<div
				className={cn(
					"grid w-full gap-6 mt-8 md:mt-16 self-stretch",
					recentWorkouts.length > 0 && "md:grid-cols-2",
				)}
			>
				<Card className="border-white/10 bg-white/3 text-white shadow-none h-full flex flex-col gap-4 p-6">
					<CardHeader className="p-0">
						<CardTitle className="text-white text-sm font-medium tracking-wider">
							work
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col gap-4 p-0 min-h-0">
						<SlideHighlightRegion
							className="relative flex min-h-0 flex-1 flex-col items-stretch gap-1"
							groupAriaLabel="Work experience entries"
							variant="panel"
						>
							<WorkItem
								company="prismic"
								companyRole="software engineer"
								startDate="2024"
								logo="/logos/prismic.svg"
								url="https://prismic.io"
							/>
							<WorkItem
								company="xgeeks"
								companyRole="senior software engineer"
								startDate="2021"
								endDate="2024"
								logo="/logos/xgeeks.svg"
								url="https://xgeeks.com"
							/>
						</SlideHighlightRegion>
						<a
							className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded group self-start shrink-0"
							href="https://jomifepe.notion.site/Jos-Pereira-s-Resume-2f44df11cc4f804ca168d44c4b7c9603?source=copy_link"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="see full resume (opens in new tab)"
						>
							<span className="group-hover:hidden group-focus:hidden">
								view full resume
							</span>
							<span className="hidden group-hover:inline group-focus:inline">
								view full resume 🥱
							</span>
						</a>
					</CardContent>
				</Card>
				{recentWorkouts.length > 0 && (
					<Card className="border-white/10 bg-white/3 text-white shadow-none h-full flex flex-col gap-4 p-6">
						<CardHeader className="p-0">
							<CardTitle className="text-white text-sm font-medium tracking-wider">
								workout
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-1 flex-col gap-4 p-0 min-h-0">
							<div className="flex flex-1 flex-col gap-2 min-h-0">
								{recentWorkouts.map((activity, index) => (
									<WorkoutCard
										key={activity.id}
										activity={activity}
										variant="small"
										isLastItemInList={index === recentWorkouts.length - 1}
									/>
								))}
							</div>
							<a
								className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded group self-start shrink-0"
								href="/workout"
								aria-label="view all workouts"
							>
								<span className="group-hover:hidden group-focus:hidden">
									view more workouts
								</span>
								<span className="hidden group-hover:inline group-focus:inline">
									view more workouts 💪
								</span>
							</a>
						</CardContent>
					</Card>
				)}
			</div>
			<SocialLinksGroup />
		</PageLayout>
	);
}

type TextLinkProps = {
	children: ReactNode;
	to: string;
	hoverColor?: "green" | "orange" | "purple";
};

function TextLink(props: TextLinkProps) {
	const { children, to, hoverColor = "white" } = props;

	let hoverColorClass = "";
	switch (hoverColor) {
		case "green":
			hoverColorClass = "hover:text-green-400 focus:text-green-400";
			break;
		case "orange":
			hoverColorClass = "hover:text-orange-400 focus:text-orange-400";
			break;
		case "purple":
			hoverColorClass = "hover:text-purple-400 focus:text-purple-400";
			break;
	}

	const className = cn(
		"text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded group self-start",
		hoverColorClass,
	);

	if (to.startsWith("http")) {
		return (
			<a
				className={className}
				href={to}
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		);
	}

	return (
		<Link className={className} to={to}>
			{children}
		</Link>
	);
}

const SlideHighlightContext = createContext<{
	onInteract: (e: MouseEvent<Element> | FocusEvent<Element>) => void;
} | null>(null);

type WorkExperienceProps = {
	company: string;
	companyRole: string;
	startDate: string;
	endDate?: string;
	logo?: string;
	url: string;
};

function WorkItem(props: WorkExperienceProps) {
	const { company, companyRole: role, startDate, endDate, logo, url } = props;
	const slideHighlight = useContext(SlideHighlightContext);

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${company} - ${role} (opens in new tab)`}
			className={cn(
				"relative flex cursor-pointer items-start gap-4 rounded-lg -mx-3 px-3 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
				slideHighlight != null ? "z-10" : "hover:bg-white/5 focus:bg-white/5",
			)}
			onFocus={slideHighlight != null ? slideHighlight.onInteract : undefined}
			onMouseEnter={
				slideHighlight != null ? slideHighlight.onInteract : undefined
			}
		>
			{logo && (
				<img
					src={logo}
					alt={`${company} logo`}
					className="w-12 h-12 rounded object-contain shrink-0"
				/>
			)}
			<div className="flex-1">
				<div className="flex flex-row items-baseline gap-2 mb-1 flex-wrap">
					<span className="text-white font-medium">{company}</span>
					<span className="text-white/60">·</span>
					<span className="text-white/80">{role}</span>
				</div>
				<div className="text-white/60 text-sm">
					{startDate} – {endDate || "current"}
				</div>
			</div>
		</a>
	);
}

function StatsFmIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<title>stats.fm</title>
			<path d="M77.7698 151.964H31.8607C14.3745 151.964 0.199219 166.169 0.199219 183.691V477.17C0.199219 494.691 14.3745 508.896 31.8607 508.896H77.7698C95.256 508.896 109.431 494.691 109.431 477.17V183.691C109.431 166.169 95.256 151.964 77.7698 151.964Z"></path>
			<path d="M277.239 0.72998H231.33C213.843 0.72998 199.668 14.9348 199.668 32.4574V477.17C199.668 494.691 213.843 508.896 231.33 508.896H277.239C294.726 508.896 308.9 494.691 308.9 477.17V32.4574C308.9 14.9348 294.726 0.72998 277.239 0.72998Z"></path>
			<path d="M476.702 291.035H430.794C413.306 291.035 399.133 305.24 399.133 322.761V477.168C399.133 494.691 413.306 508.896 430.794 508.896H476.702C494.19 508.896 508.363 494.691 508.363 477.168V322.761C508.363 305.24 494.19 291.035 476.702 291.035Z"></path>
		</svg>
	);
}

function RaycastIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Raycast"
		>
			<title>Raycast</title>
			<path d="M5 12.9V15L0 10L1.05 8.95L5 12.9ZM7.1 15H5L10 20L11.05 18.95L7.1 15ZM18.95 11.05L20 10L10 0L8.95 1.05L12.9 5H10.5L7.75 2.25L6.7 3.3L8.4 5H7.2V12.75H15V11.55L16.7 13.25L17.75 12.2L15 9.5V7.1L18.95 11.05ZM5.5 4.5L4.5 5.55L5.6 6.65L6.65 5.6L5.5 4.5ZM14.4 13.35L13.35 14.4L14.45 15.5L15.5 14.5L14.4 13.35ZM3.3 6.7L2.25 7.75L5 10.5V8.4L3.3 6.7ZM11.55 15H9.5L12.25 17.75L13.3 16.7L11.55 15Z" />
		</svg>
	);
}

type SocialNavItem = {
	name: string;
	url: string;
	icon: ReactNode;
	title: string;
	hoverColor?: "green" | "orange" | "purple" | "red" | "blue";
};

const SOCIAL_NAV_ITEMS: SocialNavItem[] = [
	{
		name: "github",
		url: "https://github.com/jomifepe",
		icon: <IconBrandGithub size={20} />,
		title: "github",
	},
	{
		name: "x",
		url: "https://twitter.com/jomifepe",
		icon: <IconBrandX size={20} />,
		title: "x",
	},
	{
		name: "linkedin",
		url: "https://www.linkedin.com/in/jomifepe/",
		icon: <IconBrandLinkedin size={20} />,
		title: "linkedin",
		hoverColor: "blue",
	},
	{
		name: "medium",
		url: "https://medium.com/@jomifepe",
		icon: <IconBrandMedium size={20} />,
		title: "medium",
	},
	{
		name: "raycast",
		url: "https://www.raycast.com/jomifepe",
		icon: <RaycastIcon />,
		title: "raycast",
		hoverColor: "red",
	},
	{
		name: "strava",
		url: "https://www.strava.com/athletes/jomifepe",
		icon: <IconBrandStrava size={20} />,
		title: "strava",
		hoverColor: "orange",
	},
	{
		name: "last.fm",
		url: "https://stats.fm/jomifepe",
		icon: <StatsFmIcon />,
		title: "stats.fm",
		hoverColor: "green",
	},
	{
		name: "email",
		url: "mailto:contact@jomifepe.dev",
		icon: <IconMail size={20} />,
		title: "email",
	},
];

type SlideBackdropRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

type SlideHighlightRegionProps = {
	className?: string;
	backdropClassName?: string;
	groupAriaLabel?: string;
	children: ReactNode;
} & ({ variant: "navigation"; "aria-label": string } | { variant?: "panel" });

function SlideHighlightRegion(props: SlideHighlightRegionProps) {
	const { className, backdropClassName, children, groupAriaLabel } = props;
	const navigationAriaLabel =
		props.variant === "navigation"
			? (props as { "aria-label": string })["aria-label"]
			: undefined;

	const rootRef = useRef<HTMLElement | null>(null);
	const activeTargetRef = useRef<HTMLElement | null>(null);
	const [backdrop, setBackdrop] = useState<SlideBackdropRect | null>(null);
	const [backdropVisible, setBackdropVisible] = useState(false);

	const measureActive = useCallback(() => {
		const target = activeTargetRef.current;
		const rootEl = rootRef.current;
		if (!target || !rootEl) return;
		const rootBox = rootEl.getBoundingClientRect();
		const targetBox = target.getBoundingClientRect();
		setBackdrop({
			left: targetBox.left - rootBox.left,
			top: targetBox.top - rootBox.top,
			width: targetBox.width,
			height: targetBox.height,
		});
	}, []);

	const activate = useCallback(
		(activeEl: HTMLElement | null) => {
			activeTargetRef.current = activeEl;
			if (activeEl === null) {
				setBackdropVisible(false);
				return;
			}
			window.requestAnimationFrame(() => {
				measureActive();
				setBackdropVisible(true);
			});
		},
		[measureActive],
	);

	const onInteract = useCallback(
		(event: FocusEvent<Element> | MouseEvent<Element>) => {
			activate(event.currentTarget as HTMLElement);
		},
		[activate],
	);

	const ctxValue = useMemo(() => ({ onInteract }), [onInteract]);

	useEffect(() => {
		if (!backdropVisible || activeTargetRef.current === null) return;

		const sync = () => {
			const targetEl = activeTargetRef.current;
			const rootEl = rootRef.current;
			if (!targetEl || !rootEl) return;
			const rootBox = rootEl.getBoundingClientRect();
			const anchorBox = targetEl.getBoundingClientRect();
			setBackdrop({
				left: anchorBox.left - rootBox.left,
				top: anchorBox.top - rootBox.top,
				width: anchorBox.width,
				height: anchorBox.height,
			});
		};

		window.addEventListener("resize", sync);
		window.addEventListener("scroll", sync, true);
		const resizeObserver =
			rootRef.current &&
			new ResizeObserver(() => {
				sync();
			});
		if (rootRef.current && resizeObserver) {
			resizeObserver.observe(rootRef.current);
		}
		return () => {
			window.removeEventListener("resize", sync);
			window.removeEventListener("scroll", sync, true);
			resizeObserver?.disconnect();
		};
	}, [backdropVisible]);

	const blurCaptureRoot = useCallback(
		(event: FocusEvent<HTMLElement>) => {
			const nextTarget = event.relatedTarget;
			const nextEl = nextTarget instanceof HTMLElement ? nextTarget : null;
			if (!rootRef.current?.contains(nextEl)) activate(null);
		},
		[activate],
	);

	const backdropNode = (
		<span
			aria-hidden
			className={cn(
				"pointer-events-none absolute z-0 rounded-lg bg-white/10 shadow-none",
				"transition-[left,top,width,height,opacity] duration-300 ease-out",
				"motion-reduce:transition-none motion-reduce:duration-150",
				backdropClassName,
				backdropVisible ? "opacity-100" : "opacity-0",
			)}
			style={
				backdrop !== null
					? {
							left: backdrop.left,
							top: backdrop.top,
							width: backdrop.width,
							height: backdrop.height,
						}
					: undefined
			}
		/>
	);

	const slideChildren = (
		<>
			{backdropNode}
			{children}
		</>
	);

	return (
		<SlideHighlightContext.Provider value={ctxValue}>
			{props.variant === "navigation" ? (
				<nav
					className={className}
					onBlurCapture={blurCaptureRoot}
					onMouseLeave={() => activate(null)}
					ref={(el) => {
						rootRef.current = el;
					}}
					aria-label={navigationAriaLabel}
				>
					{slideChildren}
				</nav>
			) : (
				<fieldset
					aria-label={groupAriaLabel ?? undefined}
					className={cn(
						className,
						// Reset native fieldset chrome; we only need the grouping landmark.
						"min-w-0 border-0 p-0 [-webkit-appearance:none]",
					)}
					onBlurCapture={blurCaptureRoot}
					onMouseLeave={() => activate(null)}
					ref={(el) => {
						rootRef.current = el;
					}}
				>
					{slideChildren}
				</fieldset>
			)}
		</SlideHighlightContext.Provider>
	);
}

function SocialLinksGroup() {
	return (
		<SlideHighlightRegion
			variant="navigation"
			aria-label="social links"
			className={cn(
				"relative flex flex-wrap items-center justify-end gap-1",
				"mt-8 md:mt-16",
			)}
		>
			{SOCIAL_NAV_ITEMS.map((item) => (
				<SocialLink
					key={item.name}
					icon={item.icon}
					title={item.title}
					hoverColor={item.hoverColor}
					name={item.name}
					url={item.url}
				/>
			))}
		</SlideHighlightRegion>
	);
}

type SocialLinkProps = {
	name: string;
	url: string;
	icon: ReactNode;
	title: string;
	hoverColor?: "green" | "orange" | "purple" | "red" | "blue";
	omitHoverBackdrop?: boolean;
	onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
	onFocus?: FocusEventHandler<HTMLAnchorElement>;
};

const hoverColorClass = {
	green: "hover:text-green-400 focus:text-green-400",
	orange: "hover:text-orange-400 focus:text-orange-400",
	purple: "hover:text-purple-400 focus:text-purple-400",
	red: "hover:text-red-400 focus:text-red-400",
	blue: "hover:text-blue-400 focus:text-blue-400",
	white: "hover:text-white/80 focus:text-white/80",
};

const SocialLink = forwardRef<HTMLAnchorElement, SocialLinkProps>(
	function SocialLink(props, ref) {
		const {
			name,
			url,
			icon,
			title,
			hoverColor = "white",
			omitHoverBackdrop = false,
			onFocus: onFocusProp,
			onMouseEnter: onMouseEnterProp,
		} = props;
		const slideHighlight = useContext(SlideHighlightContext);
		const suppressBackdropFill = omitHoverBackdrop || slideHighlight !== null;
		const isExternal = !url.startsWith("mailto:");
		const handleFocus = (event: FocusEvent<HTMLAnchorElement>) => {
			onFocusProp?.(event);
			slideHighlight?.onInteract(event);
		};
		const handleMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
			onMouseEnterProp?.(event);
			slideHighlight?.onInteract(event);
		};
		return (
			<a
				ref={ref}
				className={cn(
					"relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/60 hover:text-white focus:text-white",
					"transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-white/50",
					hoverColorClass[hoverColor],
					!suppressBackdropFill && "focus:bg-white/10 hover:bg-white/10",
				)}
				href={url}
				title={title}
				target={isExternal ? "_blank" : undefined}
				rel={isExternal ? "noopener noreferrer" : undefined}
				onFocus={handleFocus}
				onMouseEnter={handleMouseEnter}
				aria-label={`${name}${isExternal ? " (opens in new tab)" : ""}`}
			>
				{icon}
			</a>
		);
	},
);
