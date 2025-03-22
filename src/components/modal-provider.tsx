"use client";

import { useEffect, useState } from "react";
import { UserDetailsDialog } from "./user-info-form";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <UserDetailsDialog />
    </>
  );
};
