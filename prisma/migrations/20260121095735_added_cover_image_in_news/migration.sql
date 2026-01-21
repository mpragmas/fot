/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `News` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
