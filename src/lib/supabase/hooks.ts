"use client";

import * as React from "react";

import { createSupabaseBrowserClient } from "./browser-client";

export const useSupabaseBrowser = () => {
  const clientRef = React.useRef(createSupabaseBrowserClient());

  return clientRef.current;
};

