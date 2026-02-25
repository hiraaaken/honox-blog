import { createRoute } from "honox/factory";
import { css } from "hono/css";

// ─── Layout ───────────────────────────────────────────────────────────────────

const sectionClass = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: var(--spacing-xl);
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
`;

// ─── Profile Card ──────────────────────────────────────────────────────────────

const profileWrapperClass = css`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

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
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const snsLinkClass = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--round-full);
  border: 1px solid var(--color-border);
  color: var(--color-foreground);
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;

  svg {
    width: 1.125rem;
    height: 1.125rem;
    fill: currentColor;
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.65;
      transform: translateY(-2px);
    }
  }
`;

// ─── Introduction ──────────────────────────────────────────────────────────────

const introTextClass = css`
  font-size: var(--text-body-lg);
  line-height: 1.8;

  p + p {
    margin-top: var(--spacing-md);
  }
`;

// ─── Tech Stack ────────────────────────────────────────────────────────────────

const stackGroupClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

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
  gap: var(--spacing-xs);
`;

const techTagClass = css`
  display: inline-block;
  padding: 0.2rem 0.75rem;
  border-radius: var(--round-pill);
  font-size: var(--text-body-sm);
  font-weight: var(--font-medium);
  background-color: light-dark(var(--color-neutral-200), var(--color-neutral-800));
  color: light-dark(var(--color-neutral-700), var(--color-neutral-300));
  border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
`;

// ─── Timeline ─────────────────────────────────────────────────────────────────

const timelineClass = css`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 1.5rem;

  /* 縦線 */
  &::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background-color: light-dark(var(--color-neutral-200), var(--color-neutral-700));
  }
`;

const timelineItemClass = css`
  position: relative;
  padding-bottom: var(--spacing-lg);

  /* 丸ポイント (線中心 = left:5px, ドット幅10px → item 基準 left:-24px) */
  &::before {
    content: "";
    position: absolute;
    left: -24px;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: var(--round-full);
    background-color: var(--color-primary);
    border: 2px solid var(--color-card-background);
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

const timelineDateClass = css`
  font-size: var(--text-body-sm);
  font-weight: var(--font-semibold);
  color: var(--color-muted);
  margin-bottom: 0.25rem;
`;

const timelineTitleClass = css`
  font-size: var(--text-body-lg);
  font-weight: var(--font-bold);
  color: var(--color-foreground);
  margin-bottom: 0.25rem;
`;

const timelineDescClass = css`
  font-size: var(--text-body-sm);
  opacity: 0.75;
  line-height: 1.65;
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const GitHubIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

// Zenn ロゴ（Z 字型シルエット）
const ZennIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614 1.683c.176-.293.029-.683-.381-.683h-4.72c-.235 0-.44.117-.557.323L.03 23.239c-.088.176-.029.532.234.532zM17.666 23.771h5.835c.361 0 .537-.44.304-.703L17.049 16.8c-.176-.176-.44-.235-.674-.117l-2.956 1.58c-.264.146-.333.498-.147.732l3.923 4.542c.117.147.323.234.47.234z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

// ✏️ 技術スタックを自由に編集してください
const techStack = [
  {
    category: "Frontend",
    tags: ["TypeScript", "React", "Vue.js", "HonoX", "Tailwind CSS"],
  },
  {
    category: "Backend",
    tags: ["Node.js", "Hono", "Bun", "PostgreSQL"],
  },
  {
    category: "Infrastructure",
    tags: ["Cloudflare Workers", "Cloudflare Pages", "Docker"],
  },
  {
    category: "Tools",
    tags: ["Git", "GitHub Actions", "Vite"],
  },
] as const;

// ✏️ 経歴を自由に編集してください
const timeline = [
  {
    date: "2023年4月〜現在",
    title: "株式会社〇〇（プレースホルダー）",
    description:
      "Webアプリケーションの設計・開発に従事。TypeScript / React を中心としたフロントエンド開発を担当。",
  },
  {
    date: "2021年4月〜2023年3月",
    title: "株式会社△△（プレースホルダー）",
    description:
      "バックエンド API の開発・保守。Node.js / PostgreSQL を用いたサービス開発。",
  },
  {
    date: "2017年4月〜2021年3月",
    title: "〇〇大学 工学部（プレースホルダー）",
    description: "情報工学を専攻。在学中にプログラミングを独学で習得。",
  },
] as const;

// ─── Route ────────────────────────────────────────────────────────────────────

export default createRoute((c) => {
  return c.render(
    <section class={sectionClass}>
      {/* ヘッダー */}
      <header class={headerClass}>
        <h1>About</h1>
        <span>私について</span>
      </header>

      {/* プロフィールカード */}
      <div class={cardClass}>
        <div class={profileWrapperClass}>
          <img src="/icon.png" alt="プロフィール画像" class={profileImageClass} />
          <div class={profileInfoClass}>
            {/* ✏️ 名前・肩書きを編集してください */}
            <h2>Hiraaaken</h2>
            <p>Software Engineer / 京都在住</p>

            {/* SNSリンク ✏️ URL を差し替えてください */}
            <div class={snsLinksClass}>
              <a
                href="https://github.com/username"
                class={snsLinkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://x.com/username"
                class={snsLinkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
              <a
                href="https://zenn.dev/username"
                class={snsLinkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zenn"
              >
                <ZennIcon />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 自己紹介カード */}
      <div class={cardClass}>
        <h2 class={cardTitleClass}>自己紹介</h2>
        {/* ✏️ 自己紹介文を自由に編集してください */}
        <div class={introTextClass}>
          <p>
            京都を拠点に活動するソフトウェアエンジニアです。Web
            フロントエンドを中心に、バックエンドからインフラまで幅広く興味を持って取り組んでいます。
          </p>
          <p>
            このブログでは、日々の開発で学んだことや試したこと、技術的な気づきなどを発信しています。
            HonoX・Cloudflare Workers・TypeScript あたりのトピックが多めです。
          </p>
          <p>
            仕事や技術的な話題についてお気軽にご連絡ください。SNS
            や GitHub でのやり取りも歓迎しています。
          </p>
        </div>
      </div>

      {/* 技術スタックカード */}
      <div class={cardClass}>
        <h2 class={cardTitleClass}>技術スタック</h2>
        {techStack.map(({ category, tags }) => (
          <div class={stackGroupClass}>
            <span class={stackLabelClass}>{category}</span>
            <div class={stackTagsClass}>
              {tags.map((tag) => (
                <span class={techTagClass}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 経験・タイムラインカード */}
      <div class={cardClass}>
        <h2 class={cardTitleClass}>経験</h2>
        <div class={timelineClass}>
          {timeline.map(({ date, title, description }) => (
            <div class={timelineItemClass}>
              <p class={timelineDateClass}>{date}</p>
              <p class={timelineTitleClass}>{title}</p>
              <p class={timelineDescClass}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>,
  );
});
