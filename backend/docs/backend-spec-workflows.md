# Backend Workflows and Side Effects

This document captures the exact backend-side effects and status transitions that must be preserved when recreating the backend.

---

## Panic Alert Creation
1. Validate `victimPhone`, `latitude`, `longitude`.
2. Load `issue_type` where `code = "panic"`.
3. Insert `issue` with `severity = "critical"`, `status = "pending"`, `reporterRelation = "self"`.
4. Query nearby verified and available volunteers within 20 km.
5. Return `alertId`, `nearbyVolunteersCount`, `status`.

## Issue Creation
1. Load `issue_type` using `issueTypeCode` or default `general`.
2. Enforce `requiresAuth` for that type.
3. Validate `victimPhone`, `latitude`, `longitude`.
4. Insert `issue` with `status = "pending"` and fields from request.
5. If severity is `high` or `critical`, compute nearby volunteers within 15 km.
6. Return `issueId`, `nearbyVolunteersNotified`, `status`.

## Issue Accept (Volunteer)
1. Ensure user has `volunteer_profile`.
2. Ensure issue exists.
3. Ensure no existing assignment for that volunteer and issue.
4. Insert `issue_assignment` with `status = "accepted"`, `acceptedAt = now`.
5. Update `issue.status = "assigned"` and set `acknowledgedAt` if missing.

## Issue Status Update (Volunteer)
1. Validate `status` is `en_route` or `on_site`.
2. Ensure volunteer is assigned to the issue.
3. Update `issue_assignment.status` and set `arrivedAt` if `on_site`.
4. Update `issue.status = "in_progress"`.

## Issue Resolve (Volunteer)
1. Ensure volunteer is assigned to the issue.
2. Update `issue_assignment.status = "completed"`, set `completedAt`.
3. Update `issue.status = "resolved"`, set `resolvedAt`, set `resolutionNotes`.
4. Increment `volunteer_profile.totalResolves` by 1.

## Disaster Create (Admin)
1. Validate `disasterType` and `severity` against allowed values.
2. Insert `disaster` with `status = "active"`.
3. Store `affectedDistricts` as JSON string.

## Disaster Update (Admin)
1. Validate admin role.
2. Validate `status` in `active`, `contained`, `resolved`.
3. If status set to `contained` and `containedAt` not provided, set now.
4. If status set to `resolved` and `resolvedAt` not provided, set now.
5. Update `disaster` with provided fields.

## Disaster Team Activation (Admin)
1. Validate admin role.
2. Verify disaster and team exist.
3. Ensure no existing activation for the same disaster and team.
4. Insert `disaster_team_activation` with `status = "activated"`.

## Volunteer Onboarding
1. Validate required fields and age range.
2. Insert `volunteer_profile` with `rank = "beginner"` and `isVerified = false`.
3. Update `user.role = "volunteer"`.

## Volunteer Activations Update
1. Validate `status` in `deployed`, `completed`.
2. Ensure volunteer is member of the activation's team.
3. Update `disaster_team_activation.status` and set `deployedAt` or `completedAt`.

## Team Create (Volunteer)
1. Ensure user has `volunteer_profile`.
2. Validate `teamType`.
3. Insert `volunteer_team` with `leaderId` of current volunteer.
4. Insert `team_membership` for leader with `role = "leader"`.

## Team Join or Add Member
1. Determine target volunteer id from `volunteerId` or current volunteer.
2. If adding someone else, require leader role.
3. If membership exists and inactive, reactivate and set `joinedAt`.
4. Otherwise insert new `team_membership`.
5. Increment `volunteer_team.memberCount` by 1.

## Team Leave or Remove Member
1. If leader tries to leave their own team, block.
2. Only leader can remove others.
3. Set `team_membership.isActive = false`.
4. Decrement `volunteer_team.memberCount` with floor of 1.

## Donation Create
1. If `campaignId` missing, choose newest active campaign.
2. Validate campaign is active.
3. Convert `amount` from rupees to paisa.
4. Insert `donation` with `paymentStatus = "completed"` and `paymentProvider = "demo"`.
5. Increment `campaign.raisedAmount` by amount and `campaign.donorCount` by 1.

## Campaign Create (User)
1. Validate required fields.
2. Convert `goalAmount` to paisa.
3. If `disasterId` provided, verify disaster exists.
4. Insert `campaign` with `status = "pending_approval"`.

## Campaign Create (Admin)
1. Validate required fields and category.
2. If `disasterId` provided, verify disaster exists.
3. Insert `campaign` with `status = "active"` and `isVerified = true`.

---

## Notes
- All timestamps are server-side `new Date()` when not explicitly provided.
- All role checks use the `user.role` column from the database.
