'use client'

import { Context, sdk, SignIn } from "@farcaster/frame-sdk";
import { useCallback, useEffect } from "react";

export default function FrameProvider({ children }: { children: React.ReactNode }){
  const handleSignIn = useCallback(async (user: Context.FrameContext['user']) => {
    try {
      // Simplified sign in process since we're not using next-auth
      console.log("User signed in:", user);
    } catch (e) {
      if (e instanceof SignIn.RejectedByUser) {
        console.error("Rejected by user");
        return;
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      if (context?.client.clientFid) {
        await handleSignIn(context.user);
      }
      setTimeout(() => {
        sdk.actions.ready()
      }, 500)
    }
    init()
  }, [handleSignIn])

  return (
    <>
      {children}
    </>
  )
} 