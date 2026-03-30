import { sql, and, eq } from "drizzle-orm";
import { volunteerProfile } from "../db/schema";

export function haversineDistance(
  lat: number,
  lon: number,
  latCol: string,
  lonCol: string
) {
  const latColumn = sql.raw(latCol);
  const lonColumn = sql.raw(lonCol);

  return sql`
    (6371 * acos(
      cos(radians(${lat})) *
      cos(radians(${latColumn})) *
      cos(radians(${lonColumn}) - radians(${lon})) +
      sin(radians(${lat})) *
      sin(radians(${latColumn}))
    ))
  `;
}

export function nearbyVolunteers(
  db: any,
  lat: number,
  lon: number,
  radiusKm: number
) {
  return db
    .select({ id: volunteerProfile.id })
    .from(volunteerProfile)
    .where(
      and(
        eq(volunteerProfile.isAvailable, true),
        eq(volunteerProfile.isVerified, true),
        sql`${haversineDistance(lat, lon, "latitude", "longitude")} <= ${radiusKm}`
      )
    );
}
