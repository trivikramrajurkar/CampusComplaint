ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DEPARTMENT';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_departmentId_idx" ON "User"("departmentId");
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ComplaintUpdate" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "userId" TEXT,
  "status" "ComplaintStatus" NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ComplaintUpdate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ComplaintUpdate_complaintId_idx" ON "ComplaintUpdate"("complaintId");
CREATE INDEX IF NOT EXISTS "ComplaintUpdate_userId_idx" ON "ComplaintUpdate"("userId");
DO $$ BEGIN
  ALTER TABLE "ComplaintUpdate" ADD CONSTRAINT "ComplaintUpdate_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ComplaintUpdate" ADD CONSTRAINT "ComplaintUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "ComplaintUpdate" ("id", "complaintId", "userId", "status", "message", "createdAt")
SELECT 'legacy-' || md5(c."id"), c."id", c."studentId", 'PENDING_VERIFICATION',
       'Complaint submitted. Earlier progress history was not available.', c."createdAt"
FROM "Complaint" c
WHERE NOT EXISTS (SELECT 1 FROM "ComplaintUpdate" u WHERE u."complaintId" = c."id");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "targetUserId" TEXT,
  "action" TEXT NOT NULL,
  "oldRole" TEXT,
  "newRole" TEXT,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX IF NOT EXISTS "AuditLog_targetUserId_idx" ON "AuditLog"("targetUserId");
DO $$ BEGIN
  ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
