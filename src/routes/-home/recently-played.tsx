import type { RecentTrack } from "~/lib/statsfm";
import { cn } from "~/lib/utils";
import { TbDiscFilled } from "react-icons/tb";

type RecentlyPlayedProps = {
  track: RecentTrack | null;
  className?: string;
};

export function RecentlyPlayed(props: RecentlyPlayedProps) {
  const { track, className } = props;

  if (!track) return null;

  return (
    <div className={cn("flex flex-col items-center sm:items-start gap-1", className)}>
      <span className="text-[10px] text-foreground/40">recently played</span>
      <a
        href={track.trackUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Recently played: ${track.trackName} by ${track.artistName} on Spotify (opens in new tab)`}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2",
          "text-foreground/60 hover:text-foreground focus-visible:text-foreground",
          "hover:bg-foreground/10 focus-visible:bg-foreground/10 bg-foreground/5",
          "transition-colors motion-reduce:transition-none focus-visible:outline-none",
        )}
      >
        {track.albumImageUrl && (
          <img src={track.albumImageUrl} alt={track.albumName} className="w-8 h-8 rounded shrink-0 object-cover" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium text-foreground/80 truncate leading-tight">{track.trackName}</span>
          <span className="text-xs text-foreground/50 truncate leading-tight">{track.artistName}</span>
        </div>
        <TbDiscFilled className="ml-1 text-green-500 size-5 animate-disc-spin" />
      </a>
    </div>
  );
}
