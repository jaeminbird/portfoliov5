export interface JobInfo {
  id: number;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const jobData: JobInfo[] = [
  {
    id: 4,
    company: "Ciena",
    title: "Associate Sales Engineer",
    startDate: "Jul 2026",
    endDate: "Present",
    description: "Technical Pre-Sales"
  },
  {
    id: 1,
    company: "West Shore Home",
    title: "Applied AI Intern",
    startDate: "Jan 2026",
    endDate: "Present",
    description: "AI Applications in Business Analysis"
  },
  {
    id: 2,
    company: "HTI Lab",
    title: "ML Research Assistant",
    startDate: "May 2025",
    endDate: "Dec 2025",
    description: "LLMs in Autonomous Driving"
  },
  {
    id: 3,
    company: "JiaYou Tennis",
    title: "Software Engineer Intern",
    startDate: "Apr 2025",
    endDate: "Aug 2025",
    description: "Computer Vision & Agile Team Management"
  }
];
