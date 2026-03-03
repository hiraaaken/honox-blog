import { css } from 'hono/css'
import { Link } from '@/components/ui/Link'
import GithubIcon from '@/components/ui/GithubIcon'
import XIcon from '@/components/ui/XIcon'
import ZennIcon from '@/components/ui/ZennIcon'

const aboutClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`

const profileSectionClass = css`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
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
  padding: var(--spacing-lg);
`
const socialLinksClass = css`
  display: flex;
  gap: var(--spacing-sm);

  a {
    display: inline-flex;
    color: var(--color-foreground);
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out;
  }

  @media (hover: hover) {
    a:hover {
      opacity: 1;
    }
  }
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
          <div>
            <h3>hiraaaken</h3>
            <div class={socialLinksClass}>
              <a href="https://github.com/hiraaaken" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubIcon />
              </a>
              <a href="https://x.com/0512Ken" target="_blank" rel="noopener noreferrer" aria-label="X">
                <XIcon />
              </a>
              <a href="https://zenn.dev/hiraaaken" target="_blank" rel="noopener noreferrer" aria-label="Zenn">
                <ZennIcon />
              </a>
            </div>
          </div>
        </div>
        <p class={aboutTextClass}>
        関西在住ソフトウェアエンジニア。<br />業務アプリ作ってます。
        </p>
        <Link href="/about">read more...</Link>
      </article>
    </section>
  )
}
