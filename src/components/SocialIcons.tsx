import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";

interface SocialLink {
	name: string;
	url: string;
	icon: React.ReactNode;
}

interface SocialIconsProps {
	links?: SocialLink[];
}

const defaultLinks: SocialLink[] = [
	{
		name: "Twitter",
		url: "https://twitter.com/jomifepe",
		icon: <IconBrandX size={20} />,
	},
	{
		name: "GitHub",
		url: "https://github.com/jomifepe",
		icon: <IconBrandGithub size={20} />,
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/jomifepe/",
		icon: <IconBrandLinkedin size={20} />,
	},
	{
		name: "Raycast",
		url: "https://www.raycast.com/jomifepe",
		icon: (
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
		),
	},
	{
		name: "Email",
		url: "mailto:contact@jomifepe.dev",
		icon: <IconMail size={20} />,
	},
];

export default function SocialIcons({
	links = defaultLinks,
}: SocialIconsProps) {
	return (
		<div className="flex items-center gap-1 mt-16">
			{links.map((link) => (
				<a
					key={link.name}
					href={link.url}
					target={link.url.startsWith("mailto:") ? undefined : "_blank"}
					rel={
						link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"
					}
					className="flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
					aria-label={link.name}
				>
					{link.icon}
				</a>
			))}
		</div>
	);
}
