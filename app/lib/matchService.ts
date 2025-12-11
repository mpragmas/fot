import prisma from "@/app/lib/prisma";

// Creates the initial Match record linked to a Fixture.
// Intended to be called immediately after a Fixture is created.
export async function createInitialMatch(fixtureId: number) {
  // Status defaults to UPCOMING in the Prisma schema, so we do not need to set it explicitly.
  return prisma.match.create({
    data: {
      fixture: { connect: { id: fixtureId } },
    },
  });
}
