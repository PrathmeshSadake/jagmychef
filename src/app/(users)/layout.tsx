import SearchBar from "@/components/search-bar";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const UsersLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='h-auto w-full max-w-md mx-auto'>
      <div className='h-16 px-3 flex justify-between items-center'>
        <img
          src='https://static.wixstatic.com/media/3d3ea1_516bba3ad78b444282b2b9fa6322c366~mv2.jpg/v1/fill/w_870,h_276,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/3d3ea1_516bba3ad78b444282b2b9fa6322c366~mv2.jpg'
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
    </div>
  );
};

export default UsersLayout;
