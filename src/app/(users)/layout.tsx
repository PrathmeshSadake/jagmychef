import { ModalProvider } from "@/components/modal-provider";
import SearchBar from "@/components/search-bar";
import prisma from "@/lib/db";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const UsersLayout = async ({ children }: { children: React.ReactNode }) => {
  const count = await prisma.recipe.count({
    where: {
      status: "published",
    },
  });
  return (
    <div className='h-auto w-full max-w-md mx-auto'>
      <div className='h-36 pt-2 flex justify-between items-center'>
        <Link href={"/"}>
          <img
            src='https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcOtaDpGXE2Xe4QWREkpZdgBVA6fPIqyTxjzro'
            className='w-auto h-36 object-contain'
          />
        </Link>

        <Link href={"/shopping-list"}>
          <ShoppingBag className='w-10 h-10' />
        </Link>
      </div>
      <div className='my-4'>
        <SearchBar recipeCount={count} />
      </div>
      {children}
      <ModalProvider />
    </div>
  );
};

export default UsersLayout;
