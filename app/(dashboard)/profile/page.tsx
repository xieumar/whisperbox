"use client";

import { ProfileView } from "@/components/chat/profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();
  return <ProfileView user={user} />;
}
