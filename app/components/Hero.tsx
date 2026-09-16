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
    font-size: var(--text-body-sm);
  }
`

const heroIconClass = css`
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;

  /* 大きさはここで決める。比率は SVG の intrinsic size (203x150) と同じなので
     絵の構図は変わらない */
  > svg {
    width: var(--hero-mascot-size);
    height: auto;
    aspect-ratio: 203 / 150;
  }
`

const speechBubbleClass = css`
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--speech-bubble-bg);
    border: var(--speech-bubble-border);
    transform-origin: bottom left;
    animation: bubble-pop var(--duration-spring) var(--ease-bounce) backwards;
  }

  &::before {
    width: var(--thought-bubble-size-lg);
    left: -4%;
    bottom: 22%;
    box-shadow: var(--thought-bubble-shadow-lg);
    animation-delay: var(--thought-bubble-delay-lg);
  }

  &::after {
    width: var(--thought-bubble-size-sm);
    left: -10%;
    bottom: 15%;
    box-shadow: var(--thought-bubble-shadow-sm);
    animation-delay: var(--thought-bubble-delay-sm);
  }

  @container (max-width: 720px) {
    &::before {
      left: 50%;
      bottom: -10%;
      translate: -140% 0;
      transform-origin: center;
    }

    &::after {
      left: 40%;
      bottom: -15%;
      translate: -60% 0;
      transform-origin: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
    }
  }
`

const speechBubbleBodyClass = css`
  background-color: var(--speech-bubble-bg);
  color: var(--speech-bubble-fg);
  border: var(--speech-bubble-border);
  box-shadow: var(--speech-bubble-shadow);
  padding: calc(var(--spacing-2xl) * 1.5);
  border-radius: 50%;
  transform-origin: bottom left;
animation: bubble-pop var(--duration-spring) var(--ease-bounce) var(--speech-bubble-delay) backwards;

  @container (max-width: 720px) {
    transform-origin: center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
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
