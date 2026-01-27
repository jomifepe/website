import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandStrava,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center py-20">
			<div className="flex flex-col max-w-xl gap-4 p-4">
				<p className="text-white">
					<strong>josé pereira</strong> is a software engineer.
				</p>
				<p className="text-white">
					he enjoys the craft of building quality software.
				</p>
				<section className="mt-16">
					<h2 className="text-white text-sm font-medium mb-8 tracking-wider">
						work
					</h2>
					<div className="flex flex-col gap-6">
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
					</div>
				</section>
				<div className="flex items-center gap-1 mt-16 flex-wrap">
					<SocialLink
						name="GitHub"
						url="https://github.com/jomifepe"
						icon={<IconBrandGithub size={20} />}
					/>
					<SocialLink
						name="Twitter"
						url="https://twitter.com/jomifepe"
						icon={<IconBrandX size={20} />}
					/>
					<SocialLink
						name="LinkedIn"
						url="https://www.linkedin.com/in/jomifepe/"
						icon={<IconBrandLinkedin size={20} />}
					/>
					<SocialLink
						name="Raycast"
						url="https://www.raycast.com/jomifepe"
						icon={<RaycastIcon />}
					/>
					<SocialLink
						name="Strava"
						url="https://www.strava.com/athletes/jomifepe"
						icon={<IconBrandStrava size={20} />}
					/>
					<SocialLink
						name="Email"
						url="mailto:contact@jomifepe.dev"
						icon={<IconMail size={20} />}
					/>
				</div>
			</div>
		</div>
	);
}

type WorkItem = {
	company: string;
	companyRole: string;
	startDate: string;
	endDate?: string;
	logo?: string;
	url?: string;
};

function WorkItem(props: WorkItem) {
	const { company, companyRole: role, startDate, endDate, logo, url } = props;

	const content = (
		<>
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
		</>
	);

	if (url) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-start gap-4 p-3 -m-3 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
			>
				{content}
			</a>
		);
	}

	return <div className="flex items-start gap-4">{content}</div>;
}

type SocialLinkProps = {
	name: string;
	url: string;
	icon: React.ReactNode;
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

function SocialLink({ name, url, icon }: SocialLinkProps) {
	return (
		<a
			href={url}
			target={url.startsWith("mailto:") ? undefined : "_blank"}
			rel={url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
			className="flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
			aria-label={name}
		>
			{icon}
		</a>
	);
}
