// Decode Google Encoded Polyline Algorithm
export function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let lat = 0;
  let lng = 0;
  let i = 0;

  while (i < encoded.length) {
    let dlat = 0;
    let shift = 0;
    let result = 0;

    do {
      const byte = encoded.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (encoded.charCodeAt(i - 1) - 63 >= 0x20);

    dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    let dlng = 0;
    shift = 0;
    result = 0;

    do {
      const byte = encoded.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (encoded.charCodeAt(i - 1) - 63 >= 0x20);

    dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

type PolylineToSvgPathProps = {
  coords: [number, number][];
  w: number;
  h: number;
  padding: number;
};

// Project coordinates to SVG path string
export function polylineToSvgPath(props: PolylineToSvgPathProps): string {
  const { coords, w, h, padding } = props;
  if (coords.length === 0) return "";

  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const innerW = w - 2 * padding;
  const innerH = h - 2 * padding;

  const points = coords.map((c) => {
    const x = padding + ((c[1] - minLng) / lngRange) * innerW;
    const y = padding + ((maxLat - c[0]) / latRange) * innerH;
    return `${x},${y}`;
  });

  return `M${points.join(" L")}`;
}
