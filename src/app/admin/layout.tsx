import { currentUser } from "@clerk/nextjs/server";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className='max-w-7xl mx-auto py-12'>
      <div>
        <Link href={"/admin"}>
          <HomeIcon />
        </Link>
      </div>
      {children}
    </div>
  );
};

export default AdminLayout;
