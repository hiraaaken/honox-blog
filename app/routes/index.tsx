import { createRoute } from 'honox/factory'
import { Hero } from '../components/Hero'
import { getPosts, getAllTags } from '../lib/post'
import { RecentPostList } from '../components/RecentPostList'
import { PopularTags } from '../components/PopularTags'
import { css } from 'hono/css'
import { About } from '@/components/home/About'
import { Archives } from '@/components/home/Archives'

const homeContainerClass = css`
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 clamp(1rem, 5vw, 2rem);
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 2rem;
  margin-bottom: var(--spacing-xl);

  @container (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`

const mainContentClass = css`
  display: grid;
  gap: var(--size-1000);
`

const sideMenuClass = css`
  display: grid;
  gap: var(--size-1000);
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  align-content: start;
`

export default createRoute(async (c) => {
  const posts = (await getPosts()).slice(0, 6)
  const tags = (await getAllTags()).slice(0, 10)

  return c.render(
    <>
      <Hero />
      <section class={homeContainerClass}>

        {/* Main Content Column */}
        <div class={mainContentClass}>

          {/* RecentPostList */}
          <RecentPostList posts={posts} />

          {/* Popular Tags */}
          <PopularTags tags={tags} />
        </div>

        {/* SideMenu */}
        <aside class={sideMenuClass}>
          <About />
          <Archives />
        </aside>
      </section>
    </>
  )
})
