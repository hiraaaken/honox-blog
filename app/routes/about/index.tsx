import { createRoute } from "honox/factory";
import { css } from "hono/css";

const aboutSection = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: var(--spacing-base);
`;

const aboutHeader = css`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const aboutCard = css`
  border: var(--card-border);
  border-radius: 1rem;
  box-shadow: 1.5px 3px 0 var(--color-card-shadow);
  padding: 2rem;
  background-color: var(--color-card-background);
  color: var(--color-card-foreground);
`;

const profileSection = css`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const profileImage = css`
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  border: 2px solid var(--color-border);
  box-shadow: 1px 2px 0 var(--color-card-shadow);
`;

const profileInfo = css`
  flex: 1;

  h2 {
    font-size: var(--text-2xl);
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: var(--color-foreground);
  }

  p {
    margin-bottom: 0;
    opacity: 0.8;
  }
`;

const aboutContent = css`
  font-size: var(--text-body-lg);
  line-height: 1.75;
  
  p {
    margin-bottom: 1.5rem;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
`;

export default createRoute((c) => {
  return c.render(
    <>
      <section class={aboutSection}>
        <header class={aboutHeader}>
          <h1>About</h1>
          <span>Get to know more about me</span>
        </header>
        
        <div class={aboutCard}>
          <div class={profileSection}>
            <img src="/icon.png" alt="Profile" class={profileImage} />
            <div class={profileInfo}>
              <h2>Hiraaaken</h2>
              <p>Software Engineer based in Kyoto, Japan</p>
            </div>
          </div>
          
          <article class={aboutContent}>
            <p>Welcome to my blog! I'm a software engineer working in Kyoto, Japan, passionate about web development, programming, and technology.</p>
            <p>This is a HonoX-powered blog where I share my thoughts, experiences, and learnings in software engineering. Here you'll find posts about modern web technologies, development best practices, and my journey as a developer.</p>
            <p>Feel free to explore my posts and connect with me if you have any questions or want to discuss technology!</p>
          </article>
        </div>
      </section>
    </>,
  );
});