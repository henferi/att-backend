-- AlterTable
ALTER TABLE "public"."DeviceAttendance" ALTER COLUMN "deviceUsername" DROP NOT NULL,
ALTER COLUMN "devicePassword" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT,
ALTER COLUMN "editedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."LogAttendance" ALTER COLUMN "attDatetime" DROP NOT NULL,
ALTER COLUMN "attDatetime" DROP DEFAULT,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "editedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "userPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DeviceAttendance" ADD CONSTRAINT "DeviceAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LogAttendance" ADD CONSTRAINT "LogAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LogAttendance" ADD CONSTRAINT "LogAttendance_deviceAttendanceId_fkey" FOREIGN KEY ("deviceAttendanceId") REFERENCES "public"."DeviceAttendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
