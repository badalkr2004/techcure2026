CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bihar_district" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text,
	"division" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"population" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "bihar_district_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"story" text,
	"cover_image" text,
	"gallery_images" text,
	"video_url" text,
	"goal_amount" integer NOT NULL,
	"raised_amount" integer DEFAULT 0 NOT NULL,
	"donor_count" integer DEFAULT 0 NOT NULL,
	"category" text NOT NULL,
	"disaster_id" text,
	"beneficiary_name" text,
	"beneficiary_type" text,
	"organizer_id" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" text,
	"verified_at" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_update" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"media_urls" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disaster" (
	"id" text PRIMARY KEY NOT NULL,
	"disaster_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"affected_districts" text NOT NULL,
	"center_latitude" double precision,
	"center_longitude" double precision,
	"radius_km" integer,
	"severity" text NOT NULL,
	"estimated_affected_people" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"response_level" text DEFAULT 'local',
	"started_at" timestamp NOT NULL,
	"contained_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disaster_team_activation" (
	"id" text PRIMARY KEY NOT NULL,
	"disaster_id" text NOT NULL,
	"team_id" text NOT NULL,
	"assigned_area" text,
	"responsibilities" text,
	"status" text DEFAULT 'activated' NOT NULL,
	"activated_at" timestamp DEFAULT now() NOT NULL,
	"deployed_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"donor_user_id" text,
	"donor_name" text,
	"donor_email" text,
	"donor_phone" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"payment_provider" text,
	"payment_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issue" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_type_id" text NOT NULL,
	"reporter_user_id" text,
	"victim_name" text,
	"victim_phone" text NOT NULL,
	"victim_age" integer,
	"victim_gender" text,
	"reporter_name" text,
	"reporter_phone" text,
	"reporter_relation" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address" text,
	"district" text,
	"landmark" text,
	"title" text,
	"description" text,
	"severity" text DEFAULT 'medium' NOT NULL,
	"media_urls" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"disaster_id" text,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"resolution_rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issue_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"volunteer_id" text,
	"team_id" text,
	"status" text DEFAULT 'assigned' NOT NULL,
	"equipment_used" text,
	"notes" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"arrived_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issue_type" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text,
	"description" text,
	"icon" text,
	"color" text,
	"requires_auth" boolean DEFAULT true NOT NULL,
	"default_severity" text DEFAULT 'medium',
	"auto_assign_team_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "issue_type_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"data" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "team_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"volunteer_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone" text,
	"alternate_phone" text,
	"date_of_birth" timestamp,
	"gender" text,
	"blood_group" text,
	"latitude" double precision,
	"longitude" double precision,
	"district" text,
	"address" text,
	"pincode" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"phone" text NOT NULL,
	"age" integer NOT NULL,
	"profile_image" text,
	"bio" text,
	"rank" text DEFAULT 'beginner' NOT NULL,
	"experience_years" integer DEFAULT 0,
	"specializations" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"district" text NOT NULL,
	"address" text,
	"service_radius" integer DEFAULT 10,
	"total_resolves" integer DEFAULT 0 NOT NULL,
	"total_donations" integer DEFAULT 0,
	"rating" double precision DEFAULT 5,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_qualification" (
	"id" text PRIMARY KEY NOT NULL,
	"volunteer_id" text NOT NULL,
	"qualification_type" text NOT NULL,
	"certificate_url" text,
	"issued_by" text,
	"issued_at" timestamp,
	"expires_at" timestamp,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"team_type" text DEFAULT 'general' NOT NULL,
	"district" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"leader_id" text NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"total_resolves" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_disaster_id_disaster_id_fk" FOREIGN KEY ("disaster_id") REFERENCES "public"."disaster"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organizer_id_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_update" ADD CONSTRAINT "campaign_update_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disaster_team_activation" ADD CONSTRAINT "disaster_team_activation_disaster_id_disaster_id_fk" FOREIGN KEY ("disaster_id") REFERENCES "public"."disaster"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disaster_team_activation" ADD CONSTRAINT "disaster_team_activation_team_id_volunteer_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."volunteer_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_donor_user_id_user_id_fk" FOREIGN KEY ("donor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_issue_type_id_issue_type_id_fk" FOREIGN KEY ("issue_type_id") REFERENCES "public"."issue_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_disaster_id_disaster_id_fk" FOREIGN KEY ("disaster_id") REFERENCES "public"."disaster"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignment" ADD CONSTRAINT "issue_assignment_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignment" ADD CONSTRAINT "issue_assignment_volunteer_id_volunteer_profile_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignment" ADD CONSTRAINT "issue_assignment_team_id_volunteer_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."volunteer_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_team_id_volunteer_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."volunteer_team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_membership" ADD CONSTRAINT "team_membership_volunteer_id_volunteer_profile_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD CONSTRAINT "volunteer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_qualification" ADD CONSTRAINT "volunteer_qualification_volunteer_id_volunteer_profile_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_team" ADD CONSTRAINT "volunteer_team_leader_id_volunteer_profile_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."volunteer_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaign_slug_idx" ON "campaign" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "campaign_category_idx" ON "campaign" USING btree ("category");--> statement-breakpoint
CREATE INDEX "campaign_status_idx" ON "campaign" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_organizer_idx" ON "campaign" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "campaign_disaster_idx" ON "campaign" USING btree ("disaster_id");--> statement-breakpoint
CREATE INDEX "update_campaign_idx" ON "campaign_update" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "disaster_type_idx" ON "disaster" USING btree ("disaster_type");--> statement-breakpoint
CREATE INDEX "disaster_status_idx" ON "disaster" USING btree ("status");--> statement-breakpoint
CREATE INDEX "disaster_started_idx" ON "disaster" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "activation_disaster_idx" ON "disaster_team_activation" USING btree ("disaster_id");--> statement-breakpoint
CREATE INDEX "activation_team_idx" ON "disaster_team_activation" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "donation_campaign_idx" ON "donation" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "donation_donor_idx" ON "donation" USING btree ("donor_user_id");--> statement-breakpoint
CREATE INDEX "donation_status_idx" ON "donation" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "issue_type_idx" ON "issue" USING btree ("issue_type_id");--> statement-breakpoint
CREATE INDEX "issue_status_idx" ON "issue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "issue_location_idx" ON "issue" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "issue_district_idx" ON "issue" USING btree ("district");--> statement-breakpoint
CREATE INDEX "issue_created_idx" ON "issue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "issue_reporter_idx" ON "issue" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "issue_disaster_idx" ON "issue" USING btree ("disaster_id");--> statement-breakpoint
CREATE INDEX "assignment_issue_idx" ON "issue_assignment" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "assignment_volunteer_idx" ON "issue_assignment" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "assignment_team_idx" ON "issue_assignment" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_read_idx" ON "notification" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_team_idx" ON "team_membership" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "membership_volunteer_idx" ON "team_membership" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "user_profile_userId_idx" ON "user_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_profile_district_idx" ON "user_profile" USING btree ("district");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "volunteer_userId_idx" ON "volunteer_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "volunteer_district_idx" ON "volunteer_profile" USING btree ("district");--> statement-breakpoint
CREATE INDEX "volunteer_location_idx" ON "volunteer_profile" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "volunteer_available_idx" ON "volunteer_profile" USING btree ("is_available","is_verified");--> statement-breakpoint
CREATE INDEX "volunteer_rank_idx" ON "volunteer_profile" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "qual_volunteer_idx" ON "volunteer_qualification" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "qual_type_idx" ON "volunteer_qualification" USING btree ("qualification_type");--> statement-breakpoint
CREATE INDEX "team_district_idx" ON "volunteer_team" USING btree ("district");--> statement-breakpoint
CREATE INDEX "team_type_idx" ON "volunteer_team" USING btree ("team_type");--> statement-breakpoint
CREATE INDEX "team_leader_idx" ON "volunteer_team" USING btree ("leader_id");