"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FollowButton from "./FollowButton";
import { Loader2 } from "lucide-react";

interface User {
  _id: string;
  username: string;
  profileURL: string;
  isFollowing: boolean;
}

interface FollowListProps {
  userId: string;
  onFollowUpdate?: (targetUserId: string, isFollowing: boolean) => void;
}

export default function FollowList({ userId, onFollowUpdate }: FollowListProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchFollowData = async () => {
    try {
      setIsLoading(true);
      const [followersRes, followingRes] = await Promise.all([
        fetch(`${BASE_URL}/api/users/${userId}/followers`, {
          credentials: 'include'
        }),
        fetch(`${BASE_URL}/api/users/${userId}/following`, {
          credentials: 'include'
        })
      ]);

      const [followersData, followingData] = await Promise.all([
        followersRes.json(),
        followingRes.json()
      ]);

      console.log('Fetched followers:', followersData); // Add this for debugging
      console.log('Fetched following:', followingData); // Add this for debugging

      if (followersData.success && followingData.success) {
        setFollowers(followersData.followers);
        setFollowing(followingData.following);
      }
    } catch (error) {
      console.error("Failed to fetch follow data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowData();
  }, [userId]);

  const UserList = ({ users }: { users: User[] }) => (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No users found
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 rounded-lg border dark:border-zinc-800"
          >
            <Link
              href={`/dashboard/users/profile/${user._id}`}
              className="flex items-center space-x-3"
            >
              <Avatar>
                <AvatarImage src={user.profileURL} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.username}</span>
            </Link>
            <FollowButton
              userId={user._id}
              initialIsFollowing={user.isFollowing}
              onFollowToggle={(newIsFollowing) => {
                onFollowUpdate?.(user._id, newIsFollowing);
                fetchFollowData(); // Refresh the data after follow/unfollow
              }}
              onCountChange={() => {
                fetchFollowData(); // Refresh the data when follow count changes
              }}
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger 
            value="followers" 
            className="flex-1"
            onClick={() => setActiveTab('followers')}
          >
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="flex-1"
            onClick={() => setActiveTab('following')}
          >
            Following ({following.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="followers">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <UserList users={followers} />
          )}
        </TabsContent>
        <TabsContent value="following">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <UserList users={following} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
