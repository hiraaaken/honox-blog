import { css } from 'hono/css'
import { Link } from '@/components/ui/Link'

const aboutClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--size-400);
`

const profileSectionClass = css`
  display: flex;
  align-items: center;
  gap: var(--size-400);
  
  img {
    width: 3rem;
    height: 3rem;
    border-radius: var(--round-full);
    border: 2px solid var(--color-border);
  }
  
  h3 {
    font-size: var(--text-body-lg);
    font-weight: bold;
    margin: 0;
    color: var(--color-foreground);
  }
`

const aboutCardClass = css`
  background-color: var(--color-card-background);
  border: var(--card-border);
  border-radius: var(--round-xl);
  box-shadow: var(--card-shadow);
  padding: var(--size-600);
`
const aboutTextClass = css`
  font-size: var(--text-body-sm);
  line-height: 1.5;
  margin-bottom: 1rem;
  opacity: 0.8;
`

export const About = () => {
  return (
    <section class={aboutClass}>
      <header>
        <h2>About</h2>
      </header>
      <article class={aboutCardClass}>
        <div class={profileSectionClass}>
          <img src="icon.png" alt='Hiraaaken profile' />
          <h3>Hiraaaken</h3>
        </div>
        <p class={aboutTextClass}>
          Software engineer in Kyoto, Japan. I share thoughts about web development, programming, and technology.
        </p>
        <Link href="/about">read more...</Link>
      </article>
    </section>
  )
}
