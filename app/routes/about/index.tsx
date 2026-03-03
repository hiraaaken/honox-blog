import { createRoute } from "honox/factory";
import { css } from "hono/css";
import { TechStackTag } from "@/islands/TechStackTag";
import { InfoTooltip } from "@/islands/InfoTooltip";
import GithubIcon from "@/components/ui/GithubIcon";
import XIcon from "@/components/ui/XIcon";
import ZennIcon from "@/components/ui/ZennIcon";

// ─── Layout ───────────────────────────────────────────────────────────────────

const sectionClass = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: var(--spacing-base);
`;

const headerClass = css`
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);

  span {
    font-size: var(--text-body-lg);
    opacity: 0.6;
  }
`;

const cardClass = css`
  border: var(--card-border);
  border-radius: var(--round-xl);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
  background-color: var(--color-card-background);
  color: var(--color-foreground);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const cardTitleClass = css`
  font-size: var(--text-heading-md);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid light-dark(
    var(--color-neutral-200),
    var(--color-neutral-700)
  );

  & button {
    margin-left: var(--spacing-sm);
  }
`;

// ─── Profile Card ──────────────────────────────────────────────────────────────

const profileWrapperClass = css`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid light-dark( var(--color-neutral-200), var(--color-neutral-700));

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const profileImageClass = css`
  width: 6rem;
  height: 6rem;
  border-radius: var(--round-full);
  border: var(--border-width-thick) solid var(--color-border);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

const profileInfoClass = css`
  flex: 1;

  h2 {
    font-size: var(--text-heading-md);
    font-weight: var(--font-bold);
    margin-bottom: var(--spacing-xs);
    color: var(--color-foreground);
  }

  p {
    font-size: var(--text-body);
    opacity: 0.7;
    margin-bottom: var(--spacing-sm);
  }
`;

const snsLinksClass = css`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const snsLinkClass = css`
  display: inline-flex;
  color: var(--color-foreground);
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }
`;

// ─── Introduction ──────────────────────────────────────────────────────────────

const introTextClass = css`
  font-size: clamp(var(--text-body-sm), 3vw, var(--text-body));
  line-height: 1.8;

  p + p {
    margin-top: var(--spacing-md);
  }
`;

// ─── Tech Stack ────────────────────────────────────────────────────────────────

const stackGroupClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  & + & {
    margin-top: var(--spacing-md);
  }
`;

const stackLabelClass = css`
  font-size: var(--text-body-sm);
  font-weight: var(--font-semibold);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const stackTagsClass = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

interface TechStack {
  category: string;
  stacks: {
    name: string;
    rate: number; // 1-3のレベルを想定
  }[];
}


const techStacks: TechStack[] = [
  {
    category: "Languages",
    stacks: [
      {
        name: "TypeScript",
        rate: 2,
      },
      {
        name: "JavaScript",
        rate: 3,
      },
      {
        name: "Java",
        rate: 2,
      },
      {
        name: "Kotlin",
        rate: 2,
      },
      {
        name: "C#",
        rate: 1,
      },
      {
        name: "Haskell",
        rate: 1,
      },
    ],
  },
  {
    category: "Framworks/Libraries",
    stacks: [
      {
        name: "Vue.js",
        rate: 2,
      },
      {
        name: "Spring Boot",
        rate: 2,
      },
      {
        name: "Hono/HonoX",
        rate: 1,
      },
      {
        name: "Svelte",
        rate: 1,
      },
    ],
  },
  {
    category: "Infrastructure",
    stacks: [
      {
        name: "Cloudflare",
        rate: 1,
      },
      {
        name: "AWS",
        rate: 1,
      },
      {
        name: "Docker",
        rate: 2,
      },
    ],
  },
  {
    category: "Databases",
    stacks: [
      {
        name: "MySQL",
        rate: 2,
      },
      {
        name: "Oracle Database",
        rate: 2,
      },
    ],
  }
];


// ─── Route ────────────────────────────────────────────────────────────────────

export default createRoute((c) => {
  return c.render(
    <section class={sectionClass}>
      {/* ヘッダー */}
      <header class={headerClass}>
        <h1>About</h1>
      </header>

      {/* プロフィール・自己紹介カード */}
      <div class={cardClass}>
        <div class={profileWrapperClass}>
          <img src="/icon.png" alt="プロフィール画像" class={profileImageClass} />
          <div class={profileInfoClass}>
            <h2>hiraaaken</h2>

            <div class={snsLinksClass}>
              <a href="https://github.com/hiraaaken" class={snsLinkClass} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubIcon size={24} />
              </a>
              <a href="https://x.com/hiraaaken" class={snsLinkClass} target="_blank" rel="noopener noreferrer" aria-label="X">
                <XIcon size={24} />
              </a>
              <a href="https://zenn.dev/hiraaaken" class={snsLinkClass} target="_blank" rel="noopener noreferrer" aria-label="Zenn">
                <ZennIcon size={24} />
              </a>
            </div>
          </div>
        </div>

        <div class={introTextClass}>
          <p>
            関西在住のエンジニアです。社内 SE として、業務アプリの開発や保守をしています。
          </p>
          <p>
            このブログでは、日々の開発で学んだことや試したこと、技術的な発見などを書き留めていきます。<br />
            アウトプットする場として、気軽に更新していく予定です👀
          </p>
          <p>
            フロント、バックエンド問わず色々興味がありますが、最近は特に 型 と CSS に興味があります。<br />
          </p>
        </div>

        <div>
          <h2 class={cardTitleClass}>
            技術スタック
            <InfoTooltip id="tech-rate" label="評価の見方">
              ★☆☆ 入門・学習中<br />
              ★★☆ 実務経験あり<br />
              ★★★ 自信をもって使える
            </InfoTooltip>
          </h2>
          {techStacks.map(({ category, stacks }) => (
            <div class={stackGroupClass}>
              <span class={stackLabelClass}>{category}</span>
              <div class={stackTagsClass}>
                {stacks.map((stack) => (
                  <TechStackTag name={stack.name} rate={stack.rate} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 class={cardTitleClass}>資格</h2>
          <ul>
            <li>応用情報技術者試験</li>
          </ul>
        </div>
      </div>
    </section>,
  );
});
