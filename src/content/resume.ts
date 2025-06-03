interface Job {
  company: string;
  period: string;
  roles: {
    title: string;
    period: string;
    achievements: string[];
  }[];
}

interface PreviousRole {
  title: string;
  company: string;
  period: string;
}

interface Project {
  title: string;
  description: string;
}

interface Skill {
  category: string;
  items: string[];
}

interface ResumeData {
  name: string;
  title: string;
  contact: {
    location: string;
    website: string;
  };
  summary: string;
  experience: Job[];
  previousRoles: PreviousRole[];
  currentProjects: Project[];
  skills: Skill[];
}

export const resumeData: ResumeData = {
  name: "Brendan T. Norris",
  title: "Lead Design Engineer",
  contact: {
    location: "Remote",
    website: "btn0s.dev",
  },
  summary:
    "Design Engineer operating at the intersection of product, design, and engineering. I lead -1 to 1 initiatives from strategic framing through hands-on execution—validating early-stage bets, building scalable systems, and shipping production code. My work spans from roadmap strategy to implementation details, always with a focus on momentum and measurable impact.",
  experience: [
    {
      company: "Backbone",
      period: "2021 - Present",
      roles: [
        {
          title: "Lead Design Engineer, Labs",
          period: "2024 - Present",
          achievements: [
            "Report directly to the CEO to lead Backbone Labs, an R&D function operating at the edge of product, design, and engineering.",
            "Hand-crafted multiple UXR prototypes for user research, then productionized the validated concepts into shipping features across iOS and Android platforms.",
            "Solved complex integration challenges for the emulator feature, architecting the technical solution while addressing strategic product positioning and user experience design.",
            "Hand-built most of the app flavor shipped to China, navigating technical constraints, localization requirements, and market-specific feature adaptations.",
            "Partner with the Director of Product to shape roadmap priorities while maintaining deep involvement in implementation and technical decisions.",
            "Built and shipped internal tooling including multiple Figma plugins (React/TypeScript) and workflow automation tools that reduced handoff time by 80% and implemented staging infrastructure to improve team velocity.",
          ],
        },
        {
          title: "Senior Design Engineer, Labs",
          period: "2023 - 2024",
          achievements: [
            "Founded and led Backbone Labs, personally building the team's first prototypes and establishing development workflows for rapid validation.",
            "Shipped multiple high-impact features from concept to production, writing code across frontend, backend, and tooling systems.",
            "Transformed internal workflows by building custom automation tools and UX improvements that increased shipping confidence across product teams.",
          ],
        },
        {
          title: "Senior Frontend Engineer, Web",
          period: "2021 - 2023",
          achievements: [
            "Architected and built Backbone's global ecommerce platform using Next.js and headless Shopify, personally writing the core systems that scaled from startup to worldwide brand.",
            "Built dynamic game discovery and SEO systems generating hundreds of optimized pages, increasing organic traffic by 30% and conversion by 20%.",
            "Developed and shipped intelligent cart systems with localization support, handling complex state management and payment flows for international users.",
          ],
        },
      ],
    },
    {
      company: "American Express",
      period: "2020 - 2021",
      roles: [
        {
          title: "Senior Software Engineer",
          period: "2020 - 2021",
          achievements: [
            "Built TimeMachine, a bi-directional system enabling incremental React adoption with 99.9% uptime across millions of customer sessions.",
            "Expanded Amex's customer support platform by launching a new travel vertical, unlocking a specialized agent network of 300+ agents.",
            "Created modernization patterns for legacy Angular applications to support hybrid delivery models and continuous feature development.",
          ],
        },
      ],
    },
  ],
  previousRoles: [
    {
      title: "Product Designer",
      company: "Sobol",
      period: "2019-2020",
    },
    {
      title: "Frontend Engineer",
      company: "Hownd",
      period: "2018-2019",
    },
    {
      title: "UI/UX Designer",
      company: "Yandy",
      period: "2017-2018",
    },
    {
      title: "Freelance Designer & Developer",
      company: "Independent",
      period: "2015-2017",
    },
  ],
  currentProjects: [
    {
      title: "rune.design",
      description:
        "Visual development environment for systems-level product thinking, built by and for design technologists.",
    },
    {
      title: "indiefindr.gg",
      description:
        "Indie game discovery platform focused on nuanced tagging, personalization, and community-driven curation.",
    },
    {
      title: "thinkhuman.co",
      description:
        "Independent design/dev studio for rapid validation and idea-stage product development.",
    },
  ],
  skills: [
    {
      category: "Design Engineering",
      items: [
        "Rapid Prototyping",
        "Systems Thinking",
        "Figma Plugins",
        "Design Systems",
      ],
    },
    {
      category: "Product & Strategy",
      items: [
        "Product Definition",
        "Cross-functional Leadership",
        "Roadmapping",
        "Validation",
      ],
    },
    {
      category: "Development",
      items: [
        "React",
        "TypeScript",
        "Frontend Architecture",
        "Full-Stack Product Delivery",
      ],
    },
  ],
};
