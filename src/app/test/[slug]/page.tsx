import { Suspense } from "react";
import TestClient from "./test-client";

export const metadata = {
  title: "Mock Test — RailPrep",
};

export default async function TestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7]">
          <div className="text-sm font-medium text-slate-500">Loading test...</div>
        </div>
      }
    >
      <TestClient slug={slug} />
    </Suspense>
  );
}
