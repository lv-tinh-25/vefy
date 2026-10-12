ALTER TABLE "parts" ALTER COLUMN "warranty_months" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "parts" ALTER COLUMN "warranty_months" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ALTER COLUMN "warranty_expiry" DROP NOT NULL;