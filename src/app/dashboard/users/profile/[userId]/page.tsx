import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import PublicProfileClient from "./PublicProfileClient";
import { getUserFromToken } from "@/utils/auth";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

interface PageProps {
  params: { userId: string };
}

interface SerializedUser {
  _id: string;
  username: string;
  email: string;
  profileURL: string | null;
  bannerURL: string | null;
  createdAt: string;
  updatedAt: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  favorites: string[];
}

// Helper function to serialize user data
function serializeUser(user: any): SerializedUser {
  if (!user) {
    throw new Error("User data is required");
  }
  
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    profileURL: user.profileURL || null,
    bannerURL: user.bannerURL || null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
    followers: user.followers?.map((id: any) => id.toString()) || [],
    following: user.following?.map((id: any) => id.toString()) || [],
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    favorites: user.favorites?.map((id: any) => id.toString()) || []
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const { userId } = resolvedParams;

  const cookieStore = await cookies();
  const cookiesList = cookieStore.getAll();
  const cookieString = cookiesList
    .map((cookie: RequestCookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const mockRequest = new NextRequest('http://dummy-url', {
    headers: {
      cookie: cookieString
    }
  });

  const user = await getUserFromToken(mockRequest);

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect to personal profile if trying to view own profile
  if (user._id.toString() === userId) {
    redirect("/dashboard/profile");
  }

  // Serialize the user data before passing to client component
  const serializedUser = serializeUser(user);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    }>
      <PublicProfileClient 
        userId={userId} 
        currentUser={serializedUser}
        showMessageButton={true}
      />
    </Suspense>
  );
}
