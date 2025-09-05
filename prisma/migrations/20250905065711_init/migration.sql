-- AlterTable
ALTER TABLE "public"."JobLevel" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."JobTitle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_departmentId_fkey" TO "fk_employee_department";

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_jobLevelId_fkey" TO "fk_employee_job_level";

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_jobTitleId_fkey" TO "fk_employee_job_title";

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_officeId_fkey" TO "fk_employee_office";

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_userId_fkey" TO "fk_employee_user";

-- RenameForeignKey
ALTER TABLE "public"."Employee" RENAME CONSTRAINT "Employee_workspaceId_fkey" TO "fk_employee_workspace";
