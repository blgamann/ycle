/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Cycle` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "updatedAt",
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Cycle" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Like" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt",
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);
