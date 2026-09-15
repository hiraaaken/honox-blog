import { css } from 'hono/css'
import { MascotIcon } from '@/components/ui/MascotIcon'

const heroSectionClass = css`
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding: var(--hero-padding-top) clamp(1rem, 5vw, 2rem) var(--hero-padding-bottom);
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: clamp(var(--spacing-sm), 3vw, var(--spacing-xl));

  @container (max-width: 720px) {
    justify-items: center;
    gap: var(--spacing-md);
    display: flex;
    flex-direction: column-reverse;
  }
`

const heroIconClass = css`
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
`

const speechBubbleClass = css`
  position: relative;
  background-color: var(--speech-bubble-bg);
  color: var(--speech-bubble-fg);
  border: var(--speech-bubble-border);
  box-shadow: var(--speech-bubble-shadow);
  padding: calc(var(--spacing-2xl) * 1.5);
  border-radius: 50%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--speech-bubble-bg);
    border: var(--speech-bubble-border);
  }

  &::before {
    width: var(--thought-bubble-size-lg);
    left: -4%;
    bottom: 22%;
    box-shadow: var(--thought-bubble-shadow-lg);
  }

  &::after {
    width: var(--thought-bubble-size-sm);
    left: -10%;
    bottom: 15%;
    box-shadow: var(--thought-bubble-shadow-sm);
  }

  @container (max-width: 720px) {
    &::before {
      left: 50%;
      bottom: -10%;
      transform: translateX(-140%);
    }

    &::after {
      left: 40%;
      bottom: -15%;
      transform: translateX(-60%);
    }
  }
`

const speechBubbleBodyClass = css`

`

const heroTitleClass = css`
  display: flex;
  flex-direction: column;
  font-size: var(--hero-title-font-size);
  font-weight: bold;
  letter-spacing: var(--hero-letter-spacing);
  line-height: var(--hero-line-height);
`

const heroDescriptionClass = css`
  display: block;
  line-height: var(--hero-line-height);
  letter-spacing: var(--hero-letter-spacing);
`


export const Hero = () => {
  return (
    <section class={heroSectionClass}>
      <div class={heroIconClass}>
        <MascotIcon />
      </div>
      <div class={speechBubbleClass}>
        <div class={speechBubbleBodyClass}>
          <h1 class={heroTitleClass}>
            <span>Hello,</span>
            <span>I'm Hiraaaken.</span>
          </h1>
          <p class={heroDescriptionClass}>
          I'm a software engineer. <br/>
          I write about programming, technology, and my thoughts.
          </p>
        </div>
      </div>
    </section>
  )
}
