import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

const codingPhrases = [
  "builds things",
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
  "lifting weights",
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
  "running",
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
  "listening to heavy sounds",
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

export function pickSentences() {
  return {
    codingSentence: rnd(codingPhrases),
    weightLiftingSentence: rnd(weightLiftingPhrases),
    runningSentence: rnd(runningPhrases),
    musicSentence: rnd(musicPhrases),
  };
}

export type Sentences = ReturnType<typeof pickSentences>;

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
      hoverColorClass = "hover:text-green-400 focus-visible:text-green-400";
      break;
    case "orange":
      hoverColorClass = "hover:text-orange-400 focus-visible:text-orange-400";
      break;
    case "purple":
      hoverColorClass = "hover:text-purple-400 focus-visible:text-purple-400";
      break;
  }

  const className = cn(
    "text-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded group self-start",
    hoverColorClass,
  );

  if (to.startsWith("http")) {
    return (
      <a className={className} href={to} target="_blank" rel="noopener noreferrer">
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

type HeroParagraphProps = {
  sentences: Sentences;
};

export function HeroParagraph(props: HeroParagraphProps) {
  const { codingSentence, weightLiftingSentence, runningSentence, musicSentence } = props.sentences;

  return (
    <div className="flex flex-col gap-1 mt-3">
      <p className="relative text-foreground/50 text-sm">
        <span
          className="absolute -left-4 top-0 font-bold flex justify-center font-mono text-green-500 tabular-nums animate-terminal-cursor motion-reduce:animate-none motion-reduce:opacity-100 select-none"
          aria-hidden="true"
        >
          _
        </span>
        he{" "}
        <TextLink to="https://github.com/jomifepe" hoverColor="purple">
          {codingSentence}
        </TextLink>{" "}
        on his computer, enjoys{" "}
        <TextLink to="/workout" hoverColor="orange">
          {weightLiftingSentence}
        </TextLink>{" "}
        and{" "}
        <TextLink to="/workout" hoverColor="orange">
          {runningSentence}
        </TextLink>
        , as well as{" "}
        <TextLink to="https://stats.fm/jomifepe" hoverColor="green">
          {musicSentence}
        </TextLink>
        .
      </p>
    </div>
  );
}
