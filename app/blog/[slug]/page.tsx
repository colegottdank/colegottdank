"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const blogPosts: Record<string, { title: string; date: string; content: React.ReactNode }> = {
  "cli-vs-mcp": {
    title: "CLI beats MCP.",
    date: "Feb 2026",
    content: (
      <>
        <p>
          I built two MCP servers. One connects Google Search Console to my coding agent, and when it worked the first time I felt like I&rsquo;d wired my house for the future.
        </p>
        <p>I barely use them anymore.</p>
        <p>
          What I use instead is CLIs. My agent runs <code>gh</code> for GitHub, <code>wrangler</code> for Cloudflare, <code>ffmpeg</code> when I need video work, a small CLI I keep around for Google Workspace. Nobody wrote an &ldquo;integration&rdquo; for any of this. The agent runs <code>--help</code>, reads the output, and gets to work.
        </p>
        <p>It took me two MCP servers to figure that out.</p>
        <p>
          MCP starts from the premise that an agent is a fragile API client. So you stand up a server, define tool schemas, handle an auth handshake, and keep the thing running. When it breaks, you debug a protocol. My Search Console server needs re-authing every few weeks, and the fix is me, in a terminal, running a command. The plumbing for the AI needs a human plumber.
        </p>
        <p>
          A CLI assumes whoever&rsquo;s calling it knows what they&rsquo;re doing. Fifty years of Unix conventions do the rest. Flags are documented in the tool itself. Errors come back as text with an exit code. Output pipes into the next command. And an agent can compose all of it on the fly: run a command, grep the result, retry with a different flag. You don&rsquo;t ship an integration; you ship a tool, and the agent writes a new integration every time it runs.
        </p>
        <p>
          And agents grew up on terminals. Decades of shell sessions, man pages, and Stack Overflow answers are in the training data. There is no comparable corpus of people using your custom MCP server.
        </p>
        <p>
          MCP has real uses. If your product is a SaaS with OAuth and no local anything, a hosted MCP server is a fine front door. Sandboxed environments with no shell need something like it. And schemas make sense when the model calling you is small and needs guardrails.
        </p>
        <p>
          But if you&rsquo;re a tool vendor deciding what to build for the AI wave, the order is not close. Ship a CLI. Give it a <code>--json</code> flag. Write the help text like you mean it. Agents can use it today, from any harness, with zero client code.
        </p>
        <p>
          I keep my two MCP servers running, mostly as a monument. The agent walks past them to get to the terminal.
        </p>
      </>
    ),
  },
  "geo-is-fake": {
    title: "GEO is SEO for AI search. It's also fake.",
    date: "Feb 2026",
    content: (
      <>
        <p>
          AI search is my day job. I do growth engineering at a docs company where about two-thirds of traffic is already AI agents, not people. If Generative Engine Optimization worked, I&rsquo;d be its best customer, and honestly I&rsquo;d probably be selling it too.
        </p>
        <p>So take it from someone with every incentive to believe: most of what&rsquo;s sold as GEO is fake.</p>
        <p>
          The pitch goes like this. AI search engines are the new Google, so you need a new SEO. Special formatting. Entity optimization. &ldquo;AI-friendly&rdquo; content structure. Semantic markup that whispers to the models. There&rsquo;s a retainer attached.
        </p>
        <p>
          The problem is mechanical. Google was gameable because it was a ranking algorithm: crawl, index, score, rank. Every input to that scoring function was a surface you could push on, and an industry grew up pushing. LLMs don&rsquo;t work like that. There&rsquo;s no index to climb and no ranking function to reverse-engineer. A model either learned about you in training, or an agent retrieves your page at answer time and quotes whatever actually answers the question. You can&rsquo;t backlink your way into the weights.
        </p>
        <p>
          And the traffic GEO promises to win mostly doesn&rsquo;t exist.{" "}
          <a href="https://blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar/">Cloudflare&rsquo;s numbers</a> on this are brutal: for every visitor Anthropic&rsquo;s crawler refers back to a site, it crawls around 11,000 pages. Google&rsquo;s ratio is about 5 to 1. Agents read everything and send you almost no one. So even if GEO worked exactly as pitched, you&rsquo;d be winning a bigger cut of almost nothing.
        </p>
        <p>
          I want GEO to be real. A new gameable channel is exactly what a growth person prays for. I&rsquo;ve looked for the arbitrage, and what I found is plumbing. Serve your pages as clean markdown, because that&rsquo;s what agents actually request, at a fraction of the tokens. Publish an llms.txt. Don&rsquo;t block the crawlers in robots.txt. That&rsquo;s the whole technical playbook, and it&rsquo;s an afternoon of work, not a retainer.
        </p>
        <p>
          Everything past the plumbing is the oldest advice in the world wearing a new lanyard: be the best answer to a specific question. Models quote the page that actually resolves the query. Wikipedia gets cited constantly and has never done a day of GEO in its life.
        </p>
        <p>
          So the next time someone pitches you generative engine optimization, make them name the mechanism. If the answer involves the model preferring their markup, keep your money. The engine they&rsquo;re optimizing doesn&rsquo;t have the dials they&rsquo;re selling.
        </p>
      </>
    ),
  },
};

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-white overflow-y-auto">
        <div className="max-w-[600px] mx-auto py-20 px-8 md:px-12">
          <p className="text-[17px] text-black/60" style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}>
            Post not found.
          </p>
          <Link href="/" className="text-[14px] text-black/60 hover:text-black transition-colors mt-8 inline-block">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white overflow-y-auto">
      <div className="max-w-[600px] mx-auto py-20 px-8 md:px-12">
        {/* Back link */}
        <Link
          href="/"
          className="text-[14px] text-black/40 hover:text-black transition-colors mb-12 inline-block"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          ← Back
        </Link>

        {/* Title */}
        <h1
          className="text-[28px] md:text-[32px] font-normal text-black mb-4 tracking-[-0.02em] leading-tight"
          style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}
        >
          {post.title}
        </h1>

        {/* Date */}
        <p
          className="text-[14px] text-black/40 mb-12"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          {post.date}
        </p>

        {/* Content */}
        <article
          className="prose prose-lg max-w-none"
          style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}
        >
          <style jsx global>{`
            article p {
              font-size: 17px;
              line-height: 1.7;
              color: rgba(0, 0, 0, 0.9);
              margin-bottom: 1.5rem;
            }
            article h2 {
              font-size: 20px;
              font-weight: 600;
              color: black;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              font-family: Times New Roman, Times, Georgia, serif;
            }
            article ul, article ol {
              font-size: 17px;
              line-height: 1.7;
              color: rgba(0, 0, 0, 0.9);
              margin-bottom: 1.5rem;
              padding-left: 1.5rem;
            }
            article li {
              margin-bottom: 0.5rem;
            }
            article em {
              font-style: italic;
            }
            article code {
              font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
              font-size: 14px;
              background: rgba(0, 0, 0, 0.05);
              padding: 1px 5px;
              border-radius: 4px;
            }
            article a {
              text-decoration: underline;
              text-underline-offset: 2px;
            }
          `}</style>
          {post.content}
        </article>

        {/* Footer */}
        <p
          className="text-[13px] text-black/40 mt-20"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          © 2026
        </p>
      </div>
    </div>
  );
}
