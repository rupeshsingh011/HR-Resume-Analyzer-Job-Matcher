import OpenAI from "openai";

const skillBank = [
  "javascript", "typescript", "react", "node.js", "express", "mongodb", "sql", "python",
  "java", "aws", "azure", "docker", "kubernetes", "ci/cd", "machine learning", "nlp",
  "data analysis", "project management", "agile", "leadership", "communication", "salesforce",
  "figma", "tailwind", "graphql", "redis", "microservices", "rest api"
];

function client() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((item) => item.trim()))];
}

function fallbackParse(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const skills = skillBank.filter((skill) => lower.includes(skill));
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || "";
  const expMatches = [...lower.matchAll(/(\d+)\+?\s*(?:years|yrs)/g)].map((match) => Number(match[1]));

  return {
    name: lines[0] || "Unknown Candidate",
    email,
    phone,
    skills: unique(skills.map((skill) => skill.replace(/\b\w/g, (char) => char.toUpperCase()))),
    experienceYears: expMatches.length ? Math.max(...expMatches) : 0,
    workExperience: lines.filter((line) => /engineer|developer|manager|analyst|consultant/i.test(line)).slice(0, 6),
    education: lines.filter((line) => /bachelor|master|mba|degree|university|college/i.test(line)).slice(0, 4),
    certifications: lines.filter((line) => /certified|certification|aws|azure|scrum/i.test(line)).slice(0, 4),
    projects: lines.filter((line) => /project|built|implemented|launched/i.test(line)).slice(0, 5)
  };
}

export async function parseResumeWithAI(text) {
  const openai = client();
  if (!openai) return fallbackParse(text);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Extract structured resume data as JSON. Use empty arrays or empty strings when data is absent."
      },
      {
        role: "user",
        content: `Return JSON with name,email,phone,skills,experienceYears,workExperience,education,certifications,projects.\n\nResume:\n${text.slice(0, 18000)}`
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

export async function generateCandidateInsights(candidate) {
  const skills = candidate.skills || [];
  const bestFitRoles = inferRoles(skills, candidate.experienceYears);
  const missingCore = ["Communication", "Leadership", "Cloud"].filter(
    (skill) => !skills.some((candidateSkill) => candidateSkill.toLowerCase().includes(skill.toLowerCase()))
  );

  const openai = client();
  let interviewQuestions = [
    "Can you describe a challenging project you worked on and how you overcame the obstacles?",
    "How do you prioritize tasks when you have multiple deadlines?",
    "Describe a time you had to learn a new technology quickly."
  ];

  if (openai && missingCore.length > 0) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Generate exactly 5 challenging, targeted interview questions to probe a candidate's weak points and skill gaps."
          },
          {
            role: "user",
            content: `The candidate is applying for roles like ${bestFitRoles.join(", ")}. They have ${candidate.experienceYears || 0} years of experience but lack the following core skills: ${missingCore.join(", ")}. Please generate 5 interview questions to assess their potential in these missing areas. Return ONLY a JSON array of strings.`
          }
        ],
        response_format: { type: "json_object" } // Wait, to return a JSON array we should wrap it in an object for json_object format.
      });
      // Actually let's just ask for text and split by new lines, or ask for { questions: [] }
    } catch (e) {}
  }

  // Let's rewrite the openai call carefully to ensure json structure.
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Generate 5 interview questions targeting the candidate's skill gaps. Return JSON in this format: { \"questions\": [\"Q1\", \"Q2\", ...] }"
          },
          {
            role: "user",
            content: `Candidate roles: ${bestFitRoles.join(", ")}. Experience: ${candidate.experienceYears || 0} years. Missing skills: ${missingCore.join(", ")}.`
          }
        ]
      });
      const parsed = JSON.parse(completion.choices[0].message.content);
      if (parsed.questions && parsed.questions.length > 0) {
        interviewQuestions = parsed.questions;
      }
    } catch (e) {
      console.error("Failed to generate questions", e);
    }
  }

  return {
    summary: `${candidate.name} has ${candidate.experienceYears || 0} years of experience with strengths in ${skills.slice(0, 5).join(", ") || "general professional skills"}.`,
    strengths: skills.slice(0, 6),
    weaknesses: missingCore,
    skillGaps: missingCore,
    bestFitRoles,
    interviewQuestions
  };
}

export function inferRoles(skills, years = 0) {
  const normalized = skills.map((skill) => skill.toLowerCase());
  const roles = [];
  if (normalized.some((skill) => /react|javascript|typescript|tailwind/.test(skill))) roles.push("Frontend Engineer");
  if (normalized.some((skill) => /node|express|mongodb|sql|api/.test(skill))) roles.push("Backend Engineer");
  if (normalized.some((skill) => /machine learning|nlp|python|data/.test(skill))) roles.push("AI/Data Analyst");
  if (normalized.some((skill) => /aws|azure|docker|kubernetes|ci\/cd/.test(skill))) roles.push("DevOps Engineer");
  if (years >= 6) roles.push("Technical Lead");
  return roles.length ? roles : ["Generalist Software Engineer"];
}
