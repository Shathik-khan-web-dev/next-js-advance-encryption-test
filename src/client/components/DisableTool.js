"use client";

import { useEffect } from "react";
import disableDevtool from "disable-devtool";

export default function DisableTool() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // disableDevtool();
    }
  }, []);

  return null;
}
