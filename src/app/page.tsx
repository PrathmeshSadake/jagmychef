import Link from "next/link";
import { ChefHat, ShoppingCart, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <header className='border-b'>
        <div className='mx-auto container flex items-center justify-between py-4'>
          <div className='flex items-center gap-2'>
            <ChefHat className='h-6 w-6' />
            <h1 className='text-xl font-bold'>Jagmychef</h1>
          </div>
          <nav className='flex items-center gap-4'>
            <Link
              href='/recipes'
              className='text-sm font-medium hover:underline'
            >
              Browse Recipes
            </Link>
            <Link
              href='/shopping-list'
              className='text-sm font-medium hover:underline'
            >
              Shopping List
            </Link>
            <Link href='/admin'>
              <Button variant='outline' size='sm'>
                Admin Portal
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className='flex-1'>
        <section className='py-12 md:py-24 lg:py-32 bg-muted'>
          <div className='mx-auto container px-4 md:px-6'>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2'>
              <div className='flex flex-col justify-center space-y-4'>
                <div className='space-y-2'>
                  <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'>
                    Your Recipe Management Solution
                  </h1>
                  <p className='max-w-[600px] text-muted-foreground md:text-xl'>
                    Easily manage recipes, select your favorites, and generate
                    shopping lists with precise quantities.
                  </p>
                </div>
                <div className='flex flex-col gap-2 min-[400px]:flex-row'>
                  <Link href='/recipes'>
                    <Button size='lg' className='gap-1'>
                      <Utensils className='h-4 w-4' />
                      Browse Recipes
                    </Button>
                  </Link>
                  <Link href='/admin'>
                    <Button size='lg' variant='outline' className='gap-1'>
                      Admin Portal
                    </Button>
                  </Link>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                <div className='relative h-[350px] w-[350px] rounded-lg bg-gradient-to-b from-primary/20 to-primary/5 p-4'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='grid grid-cols-2 gap-4'>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className='h-32 w-32 rounded-md bg-background shadow-lg flex items-center justify-center'
                        >
                          <div className='text-center p-2'>
                            <div className='h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center'>
                              <Utensils className='h-6 w-6 text-primary' />
                            </div>
                            <p className='mt-2 text-xs font-medium'>
                              Recipe {i}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='absolute bottom-8 right-8 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg'>
                      <ShoppingCart className='h-6 w-6 text-primary-foreground' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className='py-12 md:py-24 lg:py-32'>
          <div className='mx-auto container px-4 md:px-6'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                  How It Works
                </h2>
                <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Our platform makes recipe management and shopping list
                  generation simple and efficient.
                </p>
              </div>
            </div>
            <div className='mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12'>
              <div className='flex flex-col justify-center space-y-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <Utensils className='h-6 w-6 text-primary' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-bold'>Browse Recipes</h3>
                  <p className='text-muted-foreground'>
                    Explore our extensive collection of recipes from various
                    cuisines.
                  </p>
                </div>
              </div>
              <div className='flex flex-col justify-center space-y-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <div className='font-bold text-primary'>4</div>
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-bold'>Select Four Recipes</h3>
                  <p className='text-muted-foreground'>
                    Choose your favorite four recipes to prepare for the week.
                  </p>
                </div>
              </div>
              <div className='flex flex-col justify-center space-y-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <ShoppingCart className='h-6 w-6 text-primary' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-bold'>Generate Shopping List</h3>
                  <p className='text-muted-foreground'>
                    Automatically create a consolidated shopping list with
                    precise quantities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className='border-t py-6 md:py-0'>
        <div className='mx-auto container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Jagmychef. All rights reserved.
          </p>
          <nav className='flex items-center gap-4 text-sm'>
            <Link href='#' className='text-muted-foreground hover:underline'>
              Terms
            </Link>
            <Link href='#' className='text-muted-foreground hover:underline'>
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
