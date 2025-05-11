ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'vi' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "theme" text DEFAULT 'dark' NOT NULL;