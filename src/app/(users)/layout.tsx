import SearchBar from "@/components/search-bar";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const UsersLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='h-auto w-full max-w-md mx-auto'>
      <div className='h-16 px-3 flex justify-between items-center'>
        <h1>Jagmychef</h1>
        <Link href={"/shopping-list"}>
          <ShoppingBag />
        </Link>
      </div>
      <div>
        <SearchBar />
      </div>
      {children}
    </div>
  );
};

export default UsersLayout;
