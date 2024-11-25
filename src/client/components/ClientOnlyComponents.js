"use client";

import dynamic from "next/dynamic";

const FacebookSDK = dynamic(() => import("./FacebookSDK"), { ssr: false });
const DisableTool = dynamic(() => import("./DisableTool"), { ssr: false });

export default function ClientOnlyComponents() {
  return (
    <>
      <FacebookSDK />
      <DisableTool />
    </>
  );
}
