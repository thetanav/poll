import { IconLoader2 } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center">
      <IconLoader2 className="animate-spin w-10 h-10 text-blue-500 mb-4" />
      <p className="text-neutral-500 font-medium">Loading...</p>
    </div>
  );
}
