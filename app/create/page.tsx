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
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  IconTrash,
  IconPlus,
  IconEye,
  IconPalette,
  IconClock,
  IconChartBar,
  IconArrowLeft,
} from "@tabler/icons-react";

interface PollOption {
  id: string;
  text: string;
}

const THEME_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
];

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
    <div className="min-h-screen bg-neutral-50/50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 mb-8">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home">
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-500 hover:text-neutral-900 -ml-2">
              <IconArrowLeft size={18} className="mr-1" />
              Back
            </Button>
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Create a New Poll
          </h1>
          <p className="text-lg text-neutral-500">
            Design your poll and share it with the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit}>
              <Card className="p-6 sm:p-8 space-y-8 shadow-xl border-neutral-200/60 bg-white/80 backdrop-blur-xs">
                {/* Title & Description */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-base font-semibold flex items-center gap-2">
                      Poll Question <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., What's the best programming language?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isLoading}
                      className="text-lg h-14 px-4 bg-neutral-50 border-neutral-200 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-base font-semibold">
                      Description <span className="text-neutral-400 font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add some context to your question..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      rows={3}
                      className="resize-none bg-neutral-50 border-neutral-200 focus:bg-white transition-all text-base"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Answer Options
                    </Label>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                      Min 2 options
                    </span>
                  </div>

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={option.id}
                        className="flex gap-3 items-center group animate-in fade-in slide-in-from-left-4 duration-300 fill-mode-both"
                        style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) =>
                            updateOption(option.id, e.target.value)
                          }
                          disabled={isLoading}
                          className="flex-1 h-12 bg-neutral-50 border-neutral-200 focus:bg-white transition-all"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            disabled={isLoading}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <IconTrash size={20} />
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
                    className="w-full h-12 border-dashed border-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-neutral-500">
                    <IconPlus size={20} />
                    Add Another Option
                  </Button>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                  {/* Expiration */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="expires"
                      className="text-base font-semibold flex items-center gap-2">
                      <IconClock size={18} className="text-neutral-500" />
                      Duration
                    </Label>
                    <div className="relative">
                      <select
                        id="expires"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-4 pr-10 py-3 h-12 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                        <option value="1">1 Hour</option>
                        <option value="6">6 Hours</option>
                        <option value="24">1 Day</option>
                        <option value="168">1 Week</option>
                        <option value="720">30 Days</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        <IconClock size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Theme Color */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="theme"
                      className="text-base font-semibold flex items-center gap-2">
                      <IconPalette size={18} className="text-neutral-500" />
                      Theme Color
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setThemeColor(color)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            themeColor === color
                              ? "ring-2 ring-offset-2 ring-neutral-400 scale-110"
                              : "hover:scale-110"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative ml-2">
                        <input
                          id="theme"
                          type="color"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          disabled={isLoading}
                          className="w-8 h-8 rounded-full overflow-hidden cursor-pointer p-0 border-0 opacity-0 absolute inset-0"
                        />
                        <div
                          className="w-8 h-8 rounded-full bg-linear-to-br from-neutral-100 to-neutral-300 border border-neutral-300 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
                          title="Custom Color">
                          <IconPlus size={14} className="text-neutral-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-red-100 p-1 rounded-full">
                      <IconTrash size={16} />{" "}
                      {/* Using Trash as error icon placeholder, can change */}
                    </div>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all rounded-xl"
                  style={{ backgroundColor: themeColor }}>
                  {isLoading ? "Creating Poll..." : "Create Poll"}
                </Button>
              </Card>
            </form>
          </div>

          {/* Preview Section */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <IconEye size={20} />
                <span className="font-semibold text-sm uppercase tracking-wider">
                  Live Preview
                </span>
              </div>

              <Card
                className="p-6 shadow-2xl border-0 overflow-hidden relative bg-white"
                style={{ borderTop: `6px solid ${themeColor}` }}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <IconChartBar size={120} />
                </div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2 break-words">
                    {title || "Your Question Here"}
                  </h2>
                  <p className="text-neutral-600 text-sm mb-6 break-words">
                    {description || "Description will appear here..."}
                  </p>

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={option.id}
                        className="p-3 border border-neutral-200 rounded-lg bg-neutral-50/50 flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${!option.text ? "text-neutral-400 italic" : "text-neutral-700"}`}>
                          {option.text || `Option ${index + 1}`}
                        </span>
                        <div className="h-4 w-4 rounded-full border border-neutral-300"></div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-4">
                    <span className="flex items-center gap-1">
                      <IconClock size={14} /> Expires in {expiresIn} hours
                    </span>
                    <span>0 votes</span>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
                <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 shrink-0">
                  <IconChartBar size={16} className="text-blue-600" />
                </div>
                <p>
                  <strong>Tip:</strong> Good polls have clear questions and distinct options.
                  Add a description to provide context!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
