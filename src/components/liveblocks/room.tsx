"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { usePathname } from "next/navigation";

function RoomContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Function to generate a consistent room ID from a pathname
function getRoomIdFromPath(pathname: string): string {
  // Clean and normalize the path
  const cleanPath = pathname.replace(/[^a-zA-Z0-9-_]/g, "-");
  // Add a prefix to ensure it's a valid room name
  return `portfolio-room-${cleanPath || "home"}`;
}

export function Room({ children }: { children: ReactNode }) {
  // Get the current path
  const pathname = usePathname();
  const [roomId, setRoomId] = useState("portfolio-room-loading");

  // Update room ID when the path changes
  useEffect(() => {
    setRoomId(getRoomIdFromPath(pathname));
  }, [pathname]);

  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_prod_B518NtqBD0K6zup_2jHaNZVockr4kSvu_dSxjezlsgtzpOx8RYKgCOoNgT2lsdP7"
      }
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          name: null,
          cursor: null,
          isClicking: false,
          isThrowingConfetti: false,
          isExiting: false,
        }}
      >
        <ClientSideSuspense fallback={null}>
          {() => <RoomContent>{children}</RoomContent>}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
