"use client";

import { pdf } from "@react-pdf/renderer";

import { ResumePDF } from "@/components/resume-pdf";
import { Button } from "@/components/ui/button";
import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/config/variants";
import { resumeData } from "@/content/resume";
import { Download } from "lucide-react";
import { motion } from "motion/react";
const ResumePage = () => {
  const handleDownload = async () => {
    const blob = await pdf(<ResumePDF />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "brendan-norris-resume.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex justify-between max-w-3xl mx-auto fixed p-6 inset-x-0 top-0 z-10 items-center pointer-events-none">
        <div />
        <Button
          onClick={handleDownload}
          variant="ghost"
          className="font-mono text-xs pointer-events-auto"
        >
          download
          <Download className="size-4" />
        </Button>
      </header>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 py-20 text-muted-foreground text-sm md:text-base"
      >
        <article className="prose prose-sm prose-invert mx-auto max-w-none">
          <div className="relative mb-8 border-b border-zinc-800/50 pb-4">
            <div className="flex items-center justify-between">
              <h1 className="mb-1 mt-0 text-2xl tracking-tight">
                {resumeData.name}
              </h1>
            </div>
            <p className="mb-1 text-base text-zinc-400 mt-0">
              {resumeData.title}
            </p>
            <p className="text-sm text-zinc-500">
              {resumeData.contact.location} •
              <a
                href={`https://${resumeData.contact.website}`}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {resumeData.contact.website}
              </a>
            </p>
          </div>

          <section className="mb-8">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Summary
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300">
              {resumeData.summary}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Experience
            </h2>
            {resumeData.experience.map((job) => (
              <article key={`${job.company}-${job.period}`} className="mb-6">
                <header className="flex items-baseline justify-between">
                  <h3 className="m-0 text-base font-medium text-white">
                    {job.company}
                  </h3>
                  <p className="mb-0 text-sm text-zinc-500">{job.period}</p>
                </header>

                {job.roles.map((role) => (
                  <section
                    key={`${role.title}-${role.period}`}
                    className="mb-4"
                  >
                    <h4 className="mb-0.5 mt-0 text-sm font-medium text-zinc-400">
                      {role.title}
                    </h4>
                    <p className="mb-2 text-xs text-zinc-500">{role.period}</p>
                    <ul className="max-w-none space-y-1.5">
                      {role.achievements.map((achievement, i) => (
                        <li
                          key={achievement}
                          className="text-sm leading-relaxed text-zinc-300"
                        >
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </article>
            ))}
          </section>

          <section className="mb-8">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Earlier Experience
            </h2>
            <ul className="max-w-none space-y-1.5">
              {resumeData.previousRoles.map((role) => (
                <li key={role.title} className="text-sm text-zinc-300">
                  <span className="font-medium text-white">{role.title}</span>
                  at <span className="text-zinc-400">{role.company}</span>
                  <span className="text-zinc-500">({role.period})</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Current Projects
            </h2>
            <ul className="max-w-none space-y-1.5">
              {resumeData.currentProjects.map((project) => (
                <li key={project.title} className="text-sm text-zinc-300">
                  <span className="font-medium text-white">
                    {project.title}
                  </span>
                  - {project.description}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Skills & Expertise
            </h2>
            <ul className="max-w-none space-y-1.5">
              {resumeData.skills.map((skill) => (
                <li key={skill.category} className="text-sm text-zinc-300">
                  <span className="font-medium text-white">
                    {skill.category}:
                  </span>
                  {skill.items.join(", ")}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </motion.section>
    </>
  );
};

export default ResumePage;
