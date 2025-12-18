"use client";

import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}

function Content() {
  const { user } = useUser();
  // const { data } = useMutation(api.);

  // const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content</div>;
}
