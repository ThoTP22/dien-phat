"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TechnicianIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/technician/tickets");
  }, [router]);
  return null;
}
