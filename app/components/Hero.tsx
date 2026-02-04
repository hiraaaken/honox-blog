import { css } from 'hono/css'

const heroSectionClass = css`
  height: clamp(280px, 50vw, 420px);
  padding-top: var(--hero-padding-top);
  width: 100%;
  background-color: var(--color-primary);
  color: var(--color-hero-foreground);
  border-bottom: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
`

const heroContentClass = css`
  width: fit-content;
  text-align: left;
  padding: 0 var(--spacing-md);
`

const heroTitleClass = css`
  font-size: var(--hero-title-font-size);
  font-weight: bold;
  letter-spacing: var(--hero-letter-spacing);

  span {
      display: block;
  }
`

const heroDescriptionClass = css`
  font-weight: var(--font-bold);
  letter-spacing: var(--hero-letter-spacing);
`

export const Hero = () => {
  return (
    <section class={heroSectionClass}>
      <div class={heroContentClass}>
        <h1 class={heroTitleClass}>
          <span>Hello,</span>
          <span>I'm Hiraaaken.</span>
        </h1>
        <p class={heroDescriptionClass}>
          I'm a software engineer working in Kyoto, Japan.<br />
          I'll write about my experiences and learnings in software engineering.
        </p>
      </div>
    </section>
  )
}
