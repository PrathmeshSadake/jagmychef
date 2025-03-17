import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  if (user) {
    redirect("/admin");
  }
  return (
    <div className='h-screen w-full flex justify-center items-center'>
      {children}
    </div>
  );
};

export default AuthLayout;
