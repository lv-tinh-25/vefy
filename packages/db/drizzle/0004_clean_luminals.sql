CREATE TABLE "dismissed_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"alert_key" text NOT NULL,
	"dismissed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dismissed_alerts_user_key_unique" UNIQUE("user_id","alert_key")
);
--> statement-breakpoint
ALTER TABLE "dismissed_alerts" ADD CONSTRAINT "dismissed_alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dismissed_alerts_user_idx" ON "dismissed_alerts" USING btree ("user_id");