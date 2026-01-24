"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { IconMoodSmile, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

const EMOJI_REACTIONS = ["👏", "❤️", "😂", "😡", "😢", "🤯", "💯", "👎"];

export const Reactions = ({ pollId }: { pollId: string }) => {
  const reactions = useQuery(api.polls.getPollReactions, {
    pollId: pollId as Id<"poll">,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAddingReaction, setIsAddingReaction] = useState(false);
  const addReactionMutation = useMutation(api.polls.addReaction);

  const handleAddReaction = async (emoji: string) => {
    setIsAddingReaction(true);
    try {
      await addReactionMutation({
        pollId: pollId as Id<"poll">,
        emoji,
      });
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Failed to add reaction:", err);
    } finally {
      setIsAddingReaction(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-neutral-100">
      <div className="flex flex-wrap items-center gap-2">
        {reactions &&
          reactions.map((reaction: any) => (
            <button
              key={reaction.emoji}
              onClick={() => handleAddReaction(reaction.emoji)}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm rounded-full transition-all active:scale-95 duration-200">
              <span className="text-lg leading-none filter grayscale-[0.2] group-hover:grayscale-0 transition-all">
                {reaction.emoji}
              </span>
              <span className="text-xs font-semibold text-neutral-600 group-hover:text-blue-600">
                {reaction.count}
              </span>
            </button>
          ))}

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isAddingReaction}
            className="h-9 w-9 rounded-full p-0 border border-dashed border-neutral-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 text-neutral-400 transition-all">
            <IconPlus size={18} />
          </Button>

          {showEmojiPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="absolute left-0 top-full mt-2 p-3 bg-white border border-neutral-200 rounded-2xl shadow-xl shadow-neutral-200/50 z-20 grid grid-cols-4 gap-2 w-52 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="p-2 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer text-2xl flex items-center justify-center hover:scale-110 active:scale-95 duration-200">
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
