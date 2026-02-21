"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const blogPosts: Record<string, { title: string; date: string; content: React.ReactNode }> = {
  "cli-vs-mcp": {
    title: "CLI beats MCP. Here's why.",
    date: "Feb 2026",
    content: (
      <>
        <p>
          MCP (Model Context Protocol) is the new hot thing. Anthropic built it to help AI connect to tools. It's supposed to make integrations easier.
        </p>
        <p>It doesn't.</p>

        <h2>The problem with MCP</h2>
        <p>
          MCP adds a layer you don't need. It's a protocol. Protocols mean standards, compatibility checks, and documentation. Things break. Versions mismatch. Servers crash.
        </p>
        <p>CLI tools don't have this problem. They've been around for 50 years. They work.</p>

        <h2>What actually happens</h2>
        <p>
          With MCP: You install a server. Configure JSON files. Hope the version matches. Debug connection errors. Read spec docs. Repeat.
        </p>
        <p>With CLI: You type a command. It runs.</p>

        <h2>The real measure of a tool</h2>
        <p>AI agents need to do two things:</p>
        <ol>
          <li>Send input</li>
          <li>Get output</li>
        </ol>
        <p>
          CLI does this perfectly. stdin and stdout. That's it. Universal. Works everywhere. No dependencies.
        </p>
        <p>
          MCP makes this complicated. You need an MCP server running. The agent needs an MCP client. They negotiate capabilities. Then they communicate over a custom protocol.
        </p>
        <p>Why?</p>

        <h2>What people actually want</h2>
        <p>
          Tool makers want AI to use their products. They think MCP is the answer because it's "designed for AI."
        </p>
        <p>
          Wrong. AI doesn't need special protocols. AI needs text streams. CLI gives you text streams.
        </p>

        <h2>The performance gap</h2>
        <p>MCP adds latency. Every request goes through:</p>
        <ul>
          <li>Client encoding</li>
          <li>Server decoding</li>
          <li>Processing</li>
          <li>Server encoding</li>
          <li>Client decoding</li>
        </ul>
        <p>CLI is direct. One process. No network overhead. No serialization.</p>

        <h2>When MCP makes sense</h2>
        <p>Almost never. Maybe if you're building a closed system with one vendor. Maybe.</p>
        <p>But even then, CLI works. You can wrap anything in a CLI. You can't wrap everything in MCP.</p>

        <h2>What to do instead</h2>
        <p>Build CLI tools. Make them simple. Make them output JSON if you need structure.</p>
        <p>
          AI agents can call CLI tools today. No special libraries. No protocol implementations. Just exec() and pipes.
        </p>
        <p>MCP is a solution looking for a problem. CLI already solved it.</p>
      </>
    ),
  },
  "geo-is-fake": {
    title: "GEO is SEO for AI search. It's also fake.",
    date: "Feb 2026",
    content: (
      <>
        <p>
          GEO stands for Generative Engine Optimization. The pitch: optimize your content so AI search engines (ChatGPT, Perplexity, Claude) cite you more.
        </p>
        <p>It sounds smart. It's not.</p>

        <h2>What GEO claims</h2>
        <p>
          GEO consultants say you need special formatting. Structured data. "AI-friendly" writing. Semantic markup. Specific keywords.
        </p>
        <p>They charge money for this.</p>

        <h2>What actually happens</h2>
        <p>
          AI models read text. That's it. They don't care about your markup. They don't check your schema.org tags. They process tokens.
        </p>
        <p>If your content answers a question well, AI cites you. If it doesn't, no amount of "GEO" helps.</p>

        <h2>The evidence</h2>
        <p>Look at what AI actually cites:</p>
        <ul>
          <li>Wikipedia (no special GEO)</li>
          <li>Reddit (terrible markup)</li>
          <li>Random blogs (basic HTML)</li>
          <li>Academic papers (PDFs)</li>
        </ul>
        <p>AI doesn't prefer "optimized" content. AI prefers <em>good</em> content.</p>

        <h2>Why GEO is attractive</h2>
        <p>
          It's new. SEO is crowded. GEO feels like early-2000s SEO — a fresh arbitrage opportunity.
        </p>
        <p>
          But there's no arbitrage. There's no secret signal. AI models don't rank content like Google. They generate answers based on training data and context.
        </p>
        <p>You can't optimize for something that doesn't use ranking signals.</p>

        <h2>What the AI companies say</h2>
        <p>
          OpenAI, Anthropic, Google — none of them publish "GEO guidelines." They don't tell you how to get cited more. Because there isn't a formula.
        </p>
        <p>If GEO worked, they'd warn users about it. Like Google warns about SEO manipulation. They don't.</p>

        <h2>The real way to get cited</h2>
        <p>Write clear answers to specific questions. Cover topics thoroughly. Be original. Be accurate.</p>
        <p>That's it. No tricks.</p>

        <h2>The danger of GEO</h2>
        <p>
          GEO encourages bad writing. Short paragraphs. Keyword stuffing. "AI-optimized" structure that humans hate.
        </p>
        <p>This hurts you twice. Humans bounce. AI sees low engagement and stops citing.</p>

        <h2>What to do instead</h2>
        <p>Ignore GEO. Write for humans. Explain things clearly. Build authority on topics.</p>
        <p>AI will cite you because your content is useful. Not because you followed some checklist.</p>
        <p>GEO is marketing hype. Don't fall for it.</p>
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
