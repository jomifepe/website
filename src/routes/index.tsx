import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandMedium,
	IconBrandStrava,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			{/** biome-ignore lint/correctness/useUniqueElementIds: this is needed */}
			<main id="main-content" className="flex flex-col max-w-3xl gap-4 p-4">
				<h1 className="sr-only">josé pereira - software engineer</h1>
				<p className="text-white">
					<strong>josé pereira</strong> is a software engineer.
				</p>
				<p className="text-white">
					he enjoys the craft of building quality software.
				</p>
				<section className="mt-8 md:mt-16">
					<h2 className="text-white text-sm font-medium mb-8 tracking-wider">
						work
					</h2>
					<div className="flex flex-col items-stretch gap-6">
						<WorkItem
							company="Prismic"
							companyRole="Software Engineer"
							startDate="2024"
							logo="/logos/prismic.svg"
							url="https://prismic.io"
						/>
						<WorkItem
							company="xgeeks"
							companyRole="Senior Software Engineer"
							startDate="2021"
							endDate="2024"
							logo="/logos/xgeeks.svg"
							url="https://xgeeks.com"
						/>
						<a
							className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded group self-start"
							href="https://jomifepe.notion.site/Jos-Pereira-s-Resume-2f44df11cc4f804ca168d44c4b7c9603?source=copy_link"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="see full resume (opens in new tab)"
						>
							<span className="group-hover:hidden group-focus:hidden">
								see full resume
							</span>
							<span className="hidden group-hover:inline group-focus:inline">
								see full resume 🥱
							</span>
						</a>
					</div>
				</section>
				<div className="flex items-center gap-1 mt-8 md:mt-16 flex-wrap">
					<SocialLink
						name="GitHub"
						url="https://github.com/jomifepe"
						icon={<IconBrandGithub size={20} />}
						title="GitHub"
					/>
					<SocialLink
						name="Twitter"
						url="https://twitter.com/jomifepe"
						icon={<IconBrandX size={20} />}
						title="Twitter"
					/>
					<SocialLink
						name="LinkedIn"
						url="https://www.linkedin.com/in/jomifepe/"
						icon={<IconBrandLinkedin size={20} />}
						title="LinkedIn"
					/>
					<SocialLink
						name="Medium"
						url="https://medium.com/@jomifepe"
						icon={<IconBrandMedium size={20} />}
						title="Medium"
					/>
					<SocialLink
						name="Raycast"
						url="https://www.raycast.com/jomifepe"
						icon={<RaycastIcon />}
						title="Raycast"
					/>
					<SocialLink
						name="Strava"
						url="https://www.strava.com/athletes/jomifepe"
						icon={<IconBrandStrava size={20} />}
						title="Strava"
					/>
					<SocialLink
						name="Email"
						url="mailto:contact@jomifepe.dev"
						icon={<IconMail size={20} />}
						title="Email"
					/>
				</div>
			</main>
		</div>
	);
}

type WorkItem = {
	company: string;
	companyRole: string;
	startDate: string;
	endDate?: string;
	logo?: string;
	url: string;
};

function WorkItem(props: WorkItem) {
	const { company, companyRole: role, startDate, endDate, logo, url } = props;

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${company} - ${role} (opens in new tab)`}
			className="flex items-start gap-4 p-3 -m-3 rounded-lg transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
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

type SocialLinkProps = {
	name: string;
	url: string;
	icon: React.ReactNode;
	title: string;
};

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

function SocialLink({ name, url, icon, title }: SocialLinkProps) {
	const isExternal = !url.startsWith("mailto:");
	return (
		<a
			className="flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
			href={url}
			title={title}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			aria-label={`${name}${isExternal ? " (opens in new tab)" : ""}`}
		>
			{icon}
		</a>
	);
}
