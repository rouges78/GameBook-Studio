/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Connection";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paragraph" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "type" TEXT NOT NULL DEFAULT 'normale',
    "actions" TEXT NOT NULL DEFAULT '[]',
    "incomingConnections" TEXT NOT NULL DEFAULT '[]',
    "outgoingConnections" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "x" REAL,
    "y" REAL,
    CONSTRAINT "Paragraph_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Paragraph" ("content", "createdAt", "id", "number", "projectId", "tags", "title", "updatedAt", "x", "y") SELECT "content", "createdAt", "id", "number", "projectId", "tags", "title", "updatedAt", "x", "y" FROM "Paragraph";
DROP TABLE "Paragraph";
ALTER TABLE "new_Paragraph" RENAME TO "Paragraph";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
