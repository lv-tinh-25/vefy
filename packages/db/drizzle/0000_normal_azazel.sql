CREATE TYPE "public"."vehicle_type" AS ENUM('car', 'motorcycle');--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"license_plate" varchar(20) NOT NULL,
	"color" varchar(30) NOT NULL,
	"warranty_expiry" date,
	"registration_expiry" date,
	"insurance_expiry" date,
	"oil_cycle_km" integer DEFAULT 5000 NOT NULL,
	"oil_use_days" boolean DEFAULT false NOT NULL,
	"oil_cycle_days" integer DEFAULT 180 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oil_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"date" date NOT NULL,
	"odometer" integer NOT NULL,
	"oil_type" varchar(100),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"install_date" date NOT NULL,
	"warranty_months" integer DEFAULT 12 NOT NULL,
	"warranty_expiry" date NOT NULL,
	"odometer" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oil_changes" ADD CONSTRAINT "oil_changes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;