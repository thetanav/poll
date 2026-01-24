"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import {
  IconMenu2,
  IconChartBar,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";

export const Menu = ({
  votes,
  pollAuthor,
  pollId,
}: {
  votes: number;
  pollAuthor: string;
  pollId: string;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const deletePost = useMutation(api.polls.deletePolls);

  if (!user) return null;
  const isAuthor = pollAuthor === user?.emailAddresses?.[0]?.emailAddress;

  // If not author, return nothing
  if (!isAuthor) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-9 text-neutral-500 hover:text-neutral-900 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200">
        <IconMenu2 size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 p-1 rounded-xl shadow-xl border-neutral-100 bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Poll Options
        </div>
        
        <DropdownMenuItem className="focus:bg-neutral-50 rounded-lg cursor-default">
          <IconChartBar size={16} className="mr-2 text-neutral-500" />
          <span className="flex-1">Total Votes</span>
          <span className="font-semibold text-neutral-900">{votes}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-neutral-100" />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer transition-colors"
          onClick={() => {
            if (confirm("Are you sure you want to delete this poll?")) {
              deletePost({ pollId: pollId as Id<"poll"> });
              router.push("/home");
            }
          }}>
          <IconTrash size={16} className="mr-2" />
          Delete Poll
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
