"use client";

import { SecurityView } from "@/components/chat/security-view";
import { useAuth } from "@/hooks/use-auth";

export default function SecurityPage() {
  const { user } = useAuth();
  return <SecurityView user={user} />;
}
