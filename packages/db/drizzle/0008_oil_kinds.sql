CREATE TYPE "public"."motorcycle_variant" AS ENUM('manual', 'scooter', 'electric');--> statement-breakpoint
CREATE TYPE "public"."oil_kind" AS ENUM('engine', 'transmission', 'brake', 'power_steering', 'differential', 'gear');--> statement-breakpoint
CREATE TABLE "vehicle_oil_settings" (
	"vehicle_id" uuid NOT NULL,
	"kind" "oil_kind" NOT NULL,
	"enabled" boolean NOT NULL,
	"cycle_km" integer NOT NULL,
	"use_days" boolean NOT NULL,
	"cycle_days" integer NOT NULL,
	CONSTRAINT "vehicle_oil_settings_vehicle_id_kind_pk" PRIMARY KEY("vehicle_id","kind")
);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "variant" "motorcycle_variant";--> statement-breakpoint
ALTER TABLE "oil_changes" ADD COLUMN "kind" "oil_kind" DEFAULT 'engine' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_oil_settings" ADD CONSTRAINT "vehicle_oil_settings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
UPDATE "vehicles" SET "variant" = 'manual' WHERE "type" = 'motorcycle';--> statement-breakpoint
-- Carry engine-oil cycles the owner customised; vehicles still on the old defaults (car 5000 km, motorcycle 1500 km, no time limit) get the new defaults
INSERT INTO "vehicle_oil_settings" ("vehicle_id", "kind", "enabled", "cycle_km", "use_days", "cycle_days")
SELECT "id", 'engine', true, "oil_cycle_km", "oil_use_days", "oil_cycle_days"
FROM "vehicles"
WHERE "oil_use_days" OR "oil_cycle_km" <> CASE WHEN "type" = 'car' THEN 5000 ELSE 1500 END;
