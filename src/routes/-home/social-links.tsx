import { type ReactNode } from "react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandStrava,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { SocialLink } from "~/components/SocialLink";
import { RecentlyPlayed } from "./recently-played";
import type { RecentTrack } from "~/lib/statsfm";

type SocialLink = {
  name: string;
  url: string;
  icon: ReactNode;
  title: string;
  hoverColor?: "green" | "orange" | "purple" | "red" | "blue";
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "github",
    url: "https://github.com/jomifepe",
    icon: <IconBrandGithub size={20} />,
    title: "github",
  },
  {
    name: "x",
    url: "https://x.com/jomifepe",
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

type SocialLinksGroupProps = {
  recentTrack: RecentTrack | null;
};

export function SocialLinksGroup(props: SocialLinksGroupProps) {
  const { recentTrack } = props;

  return (
    <div className="flex flex-col gap-4 sm:flex-row items-center sm:items-end mt-6 sm:mt-12">
      <RecentlyPlayed track={recentTrack} />
      <SlideHighlightRegion
        variant="navigation"
        aria-label="social links"
        className="relative flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:ml-auto"
      >
        {SOCIAL_LINKS.map((item) => (
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
    </div>
  );
}

function StatsFmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
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
