"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IconTrash, IconPlus } from "@tabler/icons-react";

interface PollOption {
  id: string;
  text: string;
}

export default function CreatePoll() {
  const router = useRouter();
  const createPoll = useMutation(api.polls.createPoll);
  const currentUser = useQuery(api.users.current);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [expiresIn, setExpiresIn] = useState("24"); // hours
  const [themeColor, setThemeColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    const newId = Math.random().toString(36).slice(2, 9);
    setOptions([...options, { id: newId, text: "" }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Poll title is required");
      return;
    }

    if (options.filter((opt) => opt.text.trim()).length < 2) {
      setError("At least 2 options are required");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to create a poll");
      return;
    }

    setIsLoading(true);

    try {
      const expiresAt = Date.now() + parseInt(expiresIn) * 60 * 60 * 1000;

      const pollId = await createPoll({
        title: title.trim(),
        description: description.trim() || undefined,
        options: options
          .filter((opt) => opt.text.trim())
          .map((opt) => opt.text.trim()),
        expiresAt,
        themeColor,
      });

      router.push(`/p/${pollId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Create a Poll
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6 shadow-lg">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Poll Title
              </Label>
              <Input
                id="title"
                placeholder="What's your question?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="text-lg h-12"
              />
              <p className="text-sm text-neutral-500">
                Make it clear and engaging
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add more context or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Poll Options</Label>
                <span className="text-sm text-neutral-500">
                  Minimum 2 options
                </span>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex gap-3 items-center">
                    <span className="text-sm font-medium text-neutral-400 min-w-8">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      disabled={isLoading}
                      className="flex-1 h-10"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        disabled={isLoading}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <IconTrash size={18} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={isLoading}
                className="w-full">
                <IconPlus size={18} />
                Add Option
              </Button>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expires" className="text-base font-semibold">
                Poll Expires In
              </Label>
              <select
                id="expires"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 h-10 border border-neutral-200 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option value="1">1 Hour</option>
                <option value="6">6 Hours</option>
                <option value="24">1 Day</option>
                <option value="168">1 Week</option>
                <option value="720">30 Days</option>
              </select>
            </div>

            {/* Theme Color */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-base font-semibold">
                Theme Color
              </Label>
              <div className="flex gap-3 items-center">
                <input
                  id="theme"
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  disabled={isLoading}
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-neutral-600">{themeColor}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold">
              {isLoading ? "Creating Poll..." : "Create Poll"}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
