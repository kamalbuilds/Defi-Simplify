export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "TradeX",
  description:
    "CrossChain DEX Aggregator & Strategy Builder",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Batch",
      href: "/batch",
    },
    {
      title: 'Your-Strategy',
      href: 'your-strategy'
    }
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
}
