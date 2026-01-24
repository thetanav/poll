"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl border-neutral-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <IconAlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          Something went wrong!
        </h2>
        <p className="text-neutral-500 mb-8">
          We encountered an unexpected error. Please try again later.
        </p>
        <Button onClick={() => reset()} className="w-full gap-2">
          <IconRefresh size={18} />
          Try Again
        </Button>
      </Card>
    </div>
  );
}
