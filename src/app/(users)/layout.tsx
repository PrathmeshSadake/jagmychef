import { ModalProvider } from "@/components/modal-provider";
import SearchBar from "@/components/search-bar";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const UsersLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='h-auto w-full max-w-md mx-auto'>
      <div className='h-16 px-3 flex justify-between items-center'>
        <img
          src='https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcbzQNr1TkFKWqywc8i6h2PtmJBgXDVeLSMrla'
          className='w-auto h-16 object-contain'
        />

        <Link href={"/shopping-list"}>
          <ShoppingBag />
        </Link>
      </div>
      <div className='my-4'>
        <SearchBar />
      </div>
      {children}
      <ModalProvider />
    </div>
  );
};

export default UsersLayout;
