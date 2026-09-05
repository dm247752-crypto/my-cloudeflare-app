import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tests } from "@/db/schema";
import InstructionsForm from "./form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [test] = await db.select().from(tests).where(eq(tests.slug, slug));
  return { title: test ? `Instructions — ${test.title}` : "Instructions" };
}

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [test] = await db.select().from(tests).where(eq(tests.slug, slug));
  if (!test) notFound();

  return <InstructionsForm test={test} />;
}
