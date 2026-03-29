# Enumerations and Allowed Values

This file lists all known enums and constant value sets enforced by the backend code or implied in the schema.

---

## User
- `user.role`: `user`, `volunteer`, `admin`

## Auth
- `user.emailVerified`: boolean

## Volunteer
- `volunteer_profile.rank`: `beginner`, `trained`, `advanced`, `expert`, `leader`
- `volunteer_profile.isAvailable`: boolean
- `volunteer_profile.isVerified`: boolean
- `volunteer_qualification.qualificationType`: `first_aid`, `cpr`, `swimming`, `driving`, `medical`, `counseling`, `rescue`

## Team
- `volunteer_team.teamType`: `rescue`, `medical`, `relief`, `general`
- `team_membership.role`: `leader`, `co-leader`, `member`

## Issue
- `issue.status`: `pending`, `acknowledged`, `assigned`, `in_progress`, `resolved`, `escalated`, `cancelled`
- `issue.severity`: `low`, `medium`, `high`, `critical`
- `issue.reporterRelation`: `self`, `family`, `bystander`
- `issue_assignment.status`: `assigned`, `accepted`, `en_route`, `on_site`, `completed`, `dropped`

## Disaster
- `disaster.disasterType`: `flood`, `earthquake`, `cyclone`, `drought`, `fire`, `pandemic`, `other`
- `disaster.severity`: `minor`, `moderate`, `severe`, `catastrophic`
- `disaster.status`: `active`, `contained`, `resolved`
- `disaster.responseLevel`: `local`, `district`, `state`, `national`
- `disaster_team_activation.status`: `activated`, `deployed`, `completed`

## Campaign
- `campaign.status`: `draft`, `pending_approval`, `active`, `completed`, `cancelled`
- `campaign.category`: `disaster_relief`, `medical`, `education`, `community`
- `campaign.beneficiaryType`: `individual`, `family`, `community`, `organization`

## Donation
- `donation.paymentStatus`: `pending`, `completed`, `failed`, `refunded`
- `donation.paymentProvider`: `razorpay`, `upi`, `bank_transfer`, `demo`

## User Profile
- `user_profile.gender`: `male`, `female`, `other`

---

## Notes
- Some enums are enforced in code only and not at DB level.
- If recreating in Express, enforce these values with validation middleware.
