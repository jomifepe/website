import { defineCachedFunction } from "nitro/cache";
import { z } from "zod";

const StatsFmTrackSchema = z.object({
  name: z.string(),
  durationMs: z.number(),
  externalIds: z.object({
    spotify: z.array(z.string()).optional(),
  }),
  albums: z.array(
    z.object({
      name: z.string(),
      image: z.string().optional(),
    }),
  ),
  artists: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

const StatsFmRecentResponseSchema = z.object({
  items: z.array(
    z.object({
      endTime: z.string(),
      track: StatsFmTrackSchema,
    }),
  ),
});

export type RecentTrack = {
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl: string | null;
  trackUrl: string | null;
  playedAt: string;
};

async function fetchRecentlyPlayedRaw(username: string): Promise<RecentTrack | null> {
  const response = await fetch(`https://api.stats.fm/api/v1/users/${username}/streams/recent?limit=1`);

  if (!response.ok) {
    throw new Error(`stats.fm fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = StatsFmRecentResponseSchema.parse(await response.json());
  const item = data.items[0];
  if (!item) return null;

  const { track } = item;
  const spotifyId = track.externalIds.spotify?.[0] ?? null;

  return {
    trackName: track.name,
    artistName: track.artists.map((a) => a.name).join(", "),
    albumName: track.albums[0]?.name ?? "",
    albumImageUrl: track.albums[0]?.image ?? null,
    trackUrl: spotifyId ? `https://open.spotify.com/track/${spotifyId}` : null,
    playedAt: item.endTime,
  };
}

export const fetchRecentlyPlayed = defineCachedFunction(fetchRecentlyPlayedRaw, {
  name: "statsfm-recently-played",
  maxAge: 60,
  getKey: (username: string) => username,
});
