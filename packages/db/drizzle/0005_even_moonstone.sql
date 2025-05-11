CREATE TYPE "public"."expense_category" AS ENUM('part', 'other');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"oil_change_id" uuid,
	"part_id" uuid,
	"date" date NOT NULL,
	"amount" integer NOT NULL,
	"category" "expense_category" NOT NULL,
	"name" varchar(200) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oil_changes" ADD COLUMN "cost" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "cost" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_oil_change_id_oil_changes_id_fk" FOREIGN KEY ("oil_change_id") REFERENCES "public"."oil_changes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;