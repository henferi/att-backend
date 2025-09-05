-- AlterTable
ALTER TABLE "public"."DeviceAttendance" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "editedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."LogAttendance" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "editedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "editedAt" DROP DEFAULT;
