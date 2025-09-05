-- CreateTable
CREATE TABLE "public"."DeviceAttendance" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceUsername" TEXT NOT NULL,
    "devicePassword" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceAttendance_pkey" PRIMARY KEY ("id")
);
