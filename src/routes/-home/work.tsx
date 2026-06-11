import { Link } from "@tanstack/react-router";
import { CardItem } from "~/components/CardItem";
import { SlideHighlightRegion } from "~/components/SlideHighlightRegion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function WorkCard() {
  return (
    <Card className="border-border bg-foreground/4 text-foreground shadow-none h-full flex flex-col gap-4 p-5 md:p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-foreground text-sm font-medium tracking-wider">work</CardTitle>
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
        <CardViewMoreLink
          to="https://jomifepe.notion.site/Jos-Pereira-s-Resume-2f44df11cc4f804ca168d44c4b7c9603?source=copy_link"
          ariaLabel="see full resume (opens in new tab)"
          label="view full resume"
          hoverLabel="🥱"
        />
      </CardContent>
    </Card>
  );
}

type WorkItemProps = {
  company: string;
  companyRole: string;
  startDate: string;
  endDate?: string;
  logo?: string;
  url: string;
};

function WorkItem(props: WorkItemProps) {
  const { company, companyRole: role, startDate, endDate, logo, url } = props;

  return (
    <CardItem
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${company} - ${role} (opens in new tab)`}
      icon={logo && <img src={logo} alt={`${company} logo`} className="w-12 h-12 rounded-md object-contain" />}
      title={
        <>
          <span className="text-foreground font-medium">{company}</span>
          <span className="text-foreground/60">·</span>
          <span className="text-foreground/80">{role}</span>
        </>
      }
      subtitle={`${startDate} – ${endDate ?? "current"}`}
    />
  );
}

type CardViewMoreLinkProps = {
  to: string;
  ariaLabel: string;
  label: string;
  hoverLabel: string;
  preload?: "intent" | "render" | "viewport" | false;
};

export function CardViewMoreLink(props: CardViewMoreLinkProps) {
  const { to, ariaLabel, label, hoverLabel, preload } = props;

  const className =
    "group relative z-10 inline-flex shrink-0 cursor-pointer items-center self-start rounded-lg px-2 py-1 text-foreground/60 hover:text-foreground/80 focus-visible:text-foreground/80 hover:bg-foreground/10 focus-visible:bg-foreground/10 transition-colors motion-reduce:transition-none focus-visible:outline-none -mx-2 -my-1 text-sm md:text-base";

  const inner = (
    <span className="inline-flex items-center">
      {label}
      <span
        className="ml-0 inline-block max-w-0 overflow-hidden transition-[max-width,margin] duration-200 ease-out group-hover:ml-1.5 group-hover:max-w-8 motion-reduce:transition-none group-focus-within:ml-1.5 group-focus-within:max-w-8"
        aria-hidden
      >
        <span className="inline-block origin-center text-base leading-none transition-transform duration-200 ease-out scale-50 group-hover:scale-110 motion-reduce:scale-100 motion-reduce:transition-none group-focus-within:scale-110">
          {hoverLabel}
        </span>
      </span>
    </span>
  );

  if (to.startsWith("http")) {
    return (
      <a className={className} href={to} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }

  return (
    <Link className={className} to={to} aria-label={ariaLabel} viewTransition preload={preload}>
      {inner}
    </Link>
  );
}
