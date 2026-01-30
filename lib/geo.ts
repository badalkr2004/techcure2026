/**
 * Geographic utilities for location-based features
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate bounding box for efficient database queries
 * Returns the min/max lat/lng for a box around a point
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 */
export function getBoundingBox(
    lat: number,
    lng: number,
    radiusKm: number
): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
} {
    const latChange = radiusKm / 111.32; // ~111.32 km per degree of latitude
    const lngChange = radiusKm / (111.32 * Math.cos(toRadians(lat)));

    return {
        minLat: lat - latChange,
        maxLat: lat + latChange,
        minLng: lng - lngChange,
        maxLng: lng + lngChange,
    };
}

/**
 * Check if a point is within a bounding box
 */
export function isWithinBounds(
    lat: number,
    lng: number,
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
    return (
        lat >= bounds.minLat &&
        lat <= bounds.maxLat &&
        lng >= bounds.minLng &&
        lng <= bounds.maxLng
    );
}

/**
 * Sort points by distance from a reference point
 * @param referencePoint The point to measure distance from
 * @param points Array of points with lat/lng
 * @returns Sorted array with distance added
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
    referencePoint: { latitude: number; longitude: number },
    points: T[]
): (T & { distance: number })[] {
    return points
        .map((point) => ({
            ...point,
            distance: calculateDistance(
                referencePoint.latitude,
                referencePoint.longitude,
                point.latitude,
                point.longitude
            ),
        }))
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter points within a radius
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param points Array of points to filter
 * @param radiusKm Maximum distance in kilometers
 * @returns Filtered and sorted array with distance
 */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
    centerLat: number,
    centerLng: number,
    points: T[],
    radiusKm: number
): (T & { distance: number })[] {
    return points
        .map((point) => ({
            ...point,
            distance: calculateDistance(
                centerLat,
                centerLng,
                point.latitude,
                point.longitude
            ),
        }))
        .filter((point) => point.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Get district name from coordinates (simplified lookup)
 * In production, use a proper geocoding service
 */
export async function getDistrictFromCoordinates(
    lat: number,
    lng: number
): Promise<string | null> {
    // This is a simplified implementation
    // In production, use reverse geocoding API (Google Maps, Mapbox, etc.)
    // For now, we'll return null and let the frontend handle it
    return null;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generate Google Maps URL for a location
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Generate directions URL between two points
 */
export function getDirectionsUrl(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): string {
    return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
}
