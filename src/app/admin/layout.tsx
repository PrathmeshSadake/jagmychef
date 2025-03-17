import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return <div>{children}</div>;
};

export default AdminLayout;
