"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import {
  IconExclamationCircle,
  IconExclamationMark,
  IconMenu2,
  IconPresentation,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Router } from "next/router";

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
  if (!user) return;
  if (pollAuthor != user?.emailAddresses?.[0]?.emailAddress) return;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-slate-200 bg-white p-2 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
        <IconMenu2 size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={0}
        side="bottom"
        sideOffset={4}>
        <DropdownMenuItem
          onClick={() => {
            deletePost({ pollId: pollId as Id<"poll"> });
            router.push("/home");
          }}>
          <IconTrash />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconExclamationCircle />
          Report
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconPresentation />
          {votes} vote
          {votes !== 1 ? "s" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
