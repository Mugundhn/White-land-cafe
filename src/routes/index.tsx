import { createFileRoute } from '@tanstack/react-router'
import { About, CoffeeSection, Favourites, GoogleReviews, Hero, Kitchen, SiteNav, Visit } from '@/components/site'
import { ScrollProgress } from '@/components/scroll'
import { PhotoJournal } from '@/components/photo-journal'
import { getMenu as loadMenu } from '@/server/menu'
import { getFavourites } from '@/lib/menu'

export const Route = createFileRoute('/')({
  loader: async () => ({ menu: await loadMenu(), year: new Date().getFullYear() }),
  component: Home,
  errorComponent: () => <main className="page-shell"><h1 className="page-title">A moment, please.</h1><p className="mt-5">We couldn’t load the café page. Check your connection and refresh to try again.</p></main>,
})
function Home() {
  const { menu, year } = Route.useLoaderData()
  return <><ScrollProgress /><SiteNav home /><main><Hero /><About /><Favourites items={getFavourites(menu, 8)} /><CoffeeSection /><Kitchen /><PhotoJournal /><GoogleReviews /><Visit year={year} /></main></>
}
