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
      <div className='h-24 px-3 flex justify-between items-center'>
        <img
          src='https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcbjULPdTkFKWqywc8i6h2PtmJBgXDVeLSMrla'
          className='w-auto h-24 object-contain'
        />

        <Link href={"/shopping-list"}>
          <ShoppingBag />
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
