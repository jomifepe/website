import { createFileRoute } from "@tanstack/react-router";

import SocialIcons from "../components/SocialIcons";
import WorkSection from "../components/WorkSection";

export const Route = createFileRoute("/")({ component: App });

interface WorkExperience {
	company: string;
	role: string;
	startDate: string;
	endDate?: string;
	logo?: string;
	url?: string;
}

const work: WorkExperience[] = [
	{
		company: "Prismic",
		role: "Software Engineer",
		startDate: "2024",
		logo: "/logos/prismic.svg",
		url: "https://prismic.io",
	},
	{
		company: "xgeeks",
		role: "Senior Software Engineer",
		startDate: "2021",
		endDate: "2024",
		logo: "/logos/xgeeks.svg",
		url: "https://xgeeks.com",
	}
];

function App() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center py-20">
			<div className="flex flex-col max-w-xl gap-4">
				<p className="text-white">
					<strong>josé pereira</strong> is a software engineer.
				</p>
				<p className="text-white">
					he enjoys the craft of building thoughtfully detailed applications.
				</p>
				<WorkSection experiences={work} />
				<SocialIcons />
			</div>
		</div>
	);
}
