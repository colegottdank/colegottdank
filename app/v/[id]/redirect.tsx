"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Sends humans from a share link into the feed with the video pinned. */
export default function ShareRedirect({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?v=${id}`);
  }, [id, router]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
      }}
    />
  );
}
