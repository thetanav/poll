import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconArrowLeft, IconFileUnknown } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl border-neutral-200">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-500">
          <IconFileUnknown size={32} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-neutral-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="w-full gap-2">
            <IconArrowLeft size={18} />
            Return Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
