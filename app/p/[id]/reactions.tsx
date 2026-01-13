"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { IconMoodSmile } from "@tabler/icons-react";
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
    <div className="flex items-center justify-between">
      {reactions && reactions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reactions.map((reaction: any) => (
            <button
              key={reaction.emoji}
              onClick={() => handleAddReaction(reaction.emoji)}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center gap-1 transition-colors">
              <span className="text-lg">{reaction.emoji}</span>
              <span className="text-xs font-medium text-slate-600">
                {reaction.count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">
          No reactions yet. Be the first!
        </p>
      )}
      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute right-0 bottom-10 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-lg z-10 grid grid-cols-4 gap-2 w-48 animate-in fade-in slide-in-from-bottom-5 slide-in-from-right-5 duration-200 ease">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform cursor-pointer select-none">
                {emoji}
              </button>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isAddingReaction}
          className="flex items-center gap-2">
          <IconMoodSmile size={18} />
          Add Reaction
        </Button>
      </div>
    </div>
  );
};
