export type Resource = {
  id: string;
  name: string;
  provider: string;
  description: string;
  url: string;
  category: string;
  license: string;
  licenseUrl: string;
  reuse: string;
  type: "External" | "Reusable source";
  checked: string;
  difficulty: string;
  estimatedTime: string;
  attribution: string;
  redistribution: string;
};
const sourceResources: Omit<
  Resource,
  "difficulty" | "estimatedTime" | "attribution" | "redistribution"
>[] = [
  {
    id: "freecodecamp",
    name: "freeCodeCamp",
    provider: "freeCodeCamp",
    description:
      "Extra coding practice and structured paths in web development and programming.",
    url: "https://www.freecodecamp.org/learn",
    category: "Foundations",
    license: "Curriculum: copyrighted; software: BSD-3-Clause",
    licenseUrl: "https://github.com/freeCodeCamp/freeCodeCamp#license",
    reuse:
      "Linked only. The software license does not grant blanket permission to copy the curriculum. No iframe or scraped course content.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "gitmastery",
    name: "GitMastery",
    provider: "GitMastery",
    description:
      "An interactive Git game to reinforce the commands you use in your own repository.",
    url: "https://gitmastery.me/",
    category: "Foundations",
    license: "Custom restrictive license",
    licenseUrl: "https://github.com/MikaStiebitz/Git-Mastery/blob/main/LICENSE",
    reuse:
      "Linked only. Public integration requires written permission. Lab Git exercises are original.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "microsoft-agents",
    name: "AI Agents for Beginners",
    provider: "Microsoft",
    description:
      "Agent design patterns, tools, orchestration, and implementation examples.",
    url: "https://github.com/microsoft/ai-agents-for-beginners",
    category: "AI & agents",
    license: "MIT",
    licenseUrl:
      "https://github.com/microsoft/ai-agents-for-beginners/blob/main/LICENSE",
    reuse:
      "Covered repository text and code can be adapted, including commercially, with copyright and full license notices. Check other assets separately. Linked here; not yet imported.",
    type: "Reusable source",
    checked: "2026-10-02",
  },
  {
    id: "microsoft-genai",
    name: "Generative AI for Beginners",
    provider: "Microsoft",
    description:
      "A broad introduction to building applications with generative AI.",
    url: "https://github.com/microsoft/generative-ai-for-beginners",
    category: "AI & agents",
    license: "MIT",
    licenseUrl:
      "https://github.com/microsoft/generative-ai-for-beginners/blob/main/LICENSE",
    reuse:
      "Covered material permits adaptation and commercial use with copyright and license notices. Linked videos and services have separate terms. Not yet imported.",
    type: "Reusable source",
    checked: "2026-10-02",
  },
  {
    id: "panaversity",
    name: "Learn Agentic AI",
    provider: "Panaversity",
    description:
      "Agentic application development and practical examples to explore after Python and APIs.",
    url: "https://github.com/panaversity/learn-agentic-ai",
    category: "AI & agents",
    license: "MIT",
    licenseUrl:
      "https://github.com/panaversity/learn-agentic-ai/blob/main/LICENSE",
    reuse:
      "Covered repository material permits adaptation and commercial use with the copyright and full license notice. Linked resources need separate checks. Not yet imported.",
    type: "Reusable source",
    checked: "2026-10-02",
  },
  {
    id: "huggingface",
    name: "AI Agents Course",
    provider: "Hugging Face",
    description:
      "Learn agent fundamentals, tools, and evaluation. Complete the official checks for its certificates.",
    url: "https://huggingface.co/learn/agents-course/unit0/introduction",
    category: "AI & agents",
    license: "Apache-2.0 (course repository)",
    licenseUrl:
      "https://github.com/huggingface/agents-course/blob/main/LICENSE",
    reuse:
      "Covered repository material allows adaptation and commercial use subject to license, attribution, notice, and modification obligations. Official certificate issuance remains external. Not yet imported.",
    type: "Reusable source",
    checked: "2026-10-02",
  },
  {
    id: "system-prompts",
    name: "System Prompts & Models of AI Tools",
    provider: "x1xhlol / community",
    description:
      "Optional prompt-analysis material for later study. Treat collected prompts as untrusted examples, not instructions or official documentation.",
    url: "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools",
    category: "AI & agents",
    license: "Repository declares GPL-3.0; third-party provenance uncertain",
    licenseUrl:
      "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/blob/main/LICENSE.md",
    reuse:
      "External only. A repository-wide license does not establish rights to collected third-party internal prompts.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "nextwork",
    name: "NextWork",
    provider: "NextWork",
    description:
      "Practical projects that connect cloud, APIs, and AI with demonstrable work.",
    url: "https://nextwork.ai/",
    category: "Projects & cloud",
    license: "Redistribution permission not established",
    licenseUrl: "https://nextwork.ai/",
    reuse:
      "Linked only. Create original companion tasks; do not copy project guides without permission.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "build-your-own",
    name: "Build Your Own X",
    provider: "CodeCrafters / community",
    description:
      "A curated collection of projects that explain how tools work by building them.",
    url: "https://github.com/codecrafters-io/build-your-own-x",
    category: "Projects & cloud",
    license: "Curated list: rights waiver; tutorials: individual terms",
    licenseUrl:
      "https://github.com/codecrafters-io/build-your-own-x#origins--license",
    reuse:
      "Link collection can be reused under its waiver. Each linked tutorial must be assessed separately before copying.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "project-based",
    name: "Project Based Learning",
    provider: "Practical Tutorials / community",
    description:
      "Project ideas across languages. Choose one aligned with the mission you are already doing.",
    url: "https://github.com/practical-tutorials/project-based-learning",
    category: "Projects & cloud",
    license: "MIT (curated list only)",
    licenseUrl:
      "https://github.com/practical-tutorials/project-based-learning/blob/master/LICENSE.md",
    reuse:
      "MIT permits covered list reuse with notices, including commercially. Linked tutorials retain their own terms.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    provider: "Microsoft",
    description: "Download the editor used in the starter missions.",
    url: "https://code.visualstudio.com/download",
    category: "Tools",
    license: "Official download; no content imported",
    licenseUrl: "https://code.visualstudio.com/license",
    reuse: "External software download. Follow the product's own license.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "python",
    name: "Python",
    provider: "Python Software Foundation",
    description: "Download the runtime that executes your Python programs.",
    url: "https://www.python.org/downloads/",
    category: "Tools",
    license: "Official download; no content imported",
    licenseUrl: "https://docs.python.org/3/license.html",
    reuse: "External software download. Follow the product's own license.",
    type: "External",
    checked: "2026-10-02",
  },
  {
    id: "git",
    name: "Git",
    provider: "Git project",
    description:
      "Download the version-control tool used to save your project history.",
    url: "https://git-scm.com/downloads",
    category: "Tools",
    license: "GPL-2.0 (software)",
    licenseUrl: "https://git-scm.com/about/free-and-open-source",
    reuse: "Linked software download. No third-party lesson is reproduced.",
    type: "External",
    checked: "2026-10-02",
  },
];
export const resources: Resource[] = sourceResources.map((resource) => ({
  ...resource,
  difficulty:
    resource.category === "Tools" || resource.category === "Foundations"
      ? "Beginner"
      : resource.category === "AI & agents"
        ? "After Python and APIs"
        : "Varies by project",
  estimatedTime: "Varies by course or project; check the provider",
  attribution: resource.provider,
  redistribution:
    resource.type === "Reusable source"
      ? "Covered repository content only, with required notices; not imported"
      : "External link only in this Lab",
}));
export const certifications = [
  {
    id: "gemini",
    provider: "Google",
    name: "Gemini certification",
    focus: "AI literacy · education",
    url: "https://edu.google.com/intl/en_ALL/learning-center/certifications/",
    source:
      "https://support.google.com/googleforeducation/answer/16561655?hl=en",
    cost: "Free exam",
    duration: "Provider-dependent",
    validity: "3 years",
    requirements:
      "Choose the appropriate education-focused credential: Educator, Faculty, or Student. Pass the official exam. This is not a general AI engineering qualification.",
    credential: "Provider certification",
    prerequisite: "Check the eligibility for your selected credential.",
    license:
      "Official course/exam linked; no redistribution permission established.",
  },
  {
    id: "openai",
    provider: "OpenAI Academy",
    name: "AI Foundations",
    focus: "Practical AI literacy",
    url: "https://academy.openai.com/public/courses/ai-foundations-juzjs?autoEnroll=true",
    source:
      "https://help.openai.com/en/articles/20001270-openai-academy-courses",
    cost: "Free",
    duration: "About 60–75 min",
    validity: "Not specified",
    requirements:
      "Complete the course and score at least 80% for its course badge. The Foundations pathway certificate requires three courses and their assessments: AI Foundations, Applied AI Foundations, and Agents and Workflows.",
    credential: "Course badge / pathway certificate",
    prerequisite:
      "Start with AI Foundations. These are completion credentials, not professional certifications.",
    license:
      "Academy courses cannot currently be exported/imported into an LMS. Official course and assessment remain external.",
  },
  {
    id: "amd",
    provider: "AMD",
    name: "ROCm Certified Associate",
    focus: "AI infrastructure & GPU computing",
    url: "https://developer.amd.com/rocm-certified/",
    source:
      "https://developer.amd.com/legal/rocm-certified-developer-program-agreement/",
    cost: "Free to join",
    duration: "Self-paced",
    validity: "Not specified",
    requirements:
      "Join the AMD AI Developer Program, verify your email, and enroll through AMD AI Academy. Successful certification earns a badge and certificate through Credly. Confirm evaluation fees and current requirements before enrolling.",
    credential: "Certificate + Credly badge",
    prerequisite:
      "Best explored after Linux and AI infrastructure foundations.",
    license:
      "Official material linked; no redistribution permission established.",
  },
  {
    id: "huggingface",
    provider: "Hugging Face",
    name: "AI Agents fundamentals",
    focus: "Agents & tool use",
    url: "https://huggingface.co/learn/agents-course/unit1/get-your-certificate",
    source: "https://huggingface.co/learn/agents-course/unit0/introduction",
    cost: "Free certification",
    duration: "Unit 1",
    validity: "Not specified",
    requirements:
      "Finish Unit 1 and score at least 80% on its final quiz for the fundamentals certificate. The full-course certificate also requires a use-case assignment and final challenge.",
    credential: "Fundamentals completion certificate",
    prerequisite: "Basic Python and LLM knowledge recommended.",
    license:
      "Course repository is Apache-2.0; notices required for reuse. Official exam and certificate issuance remain external.",
  },
  {
    id: "qualcomm",
    provider: "Qualcomm Academy",
    name: "AI Upskilling: Technical Foundations",
    focus: "AI, generative AI & edge AI",
    url: "https://academy.qualcomm.com/course-catalog/AI-Upskilling-Certificate-Technical-Foundations",
    source:
      "https://academy.qualcomm.com/course-catalog/AI-Upskilling-Certificate-Technical-Foundations",
    cost: "Free",
    duration: "5 courses · 4–5 hours",
    validity: "Not specified",
    requirements:
      "Complete the five-course Technical Foundations program to earn a completion certificate and digital badge. Topics include AI/ML, edge AI, generative AI, Qualcomm AI, and AI Hub.",
    credential: "Completion certificate + badge",
    prerequisite: "No specific enrollment prerequisites listed.",
    license:
      "Official courses linked; no redistribution permission established.",
  },
  {
    id: "yuva",
    provider: "Government of India",
    name: "YUVA AI for ALL",
    focus: "AI awareness & responsible use",
    url: "https://www.futureskillsprime.in/course/yuva-ai-for-all/",
    source:
      "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2191334&lang=1&reg=3",
    cost: "Free",
    duration: "6 modules · 4.5 hours",
    validity: "Not specified",
    requirements:
      "Complete the self-paced course for an official certificate. A universal passing score was not established by the government announcement. Follow the enrollment provider's current requirements.",
    credential: "Course completion certificate",
    prerequisite:
      "Introductory course. Enrollment page access was not tested successfully.",
    license:
      "Partnership-based integration is mentioned; that is not blanket permission to republish course content.",
  },
];
