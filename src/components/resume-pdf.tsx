import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { resumeData } from "@/content/resume";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10, // 16pt equivalent in PDF units
    lineHeight: 1.2,
    color: "#333",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 15,
  },
  name: {
    fontSize: 14, // Slightly larger for name
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 10,
    marginBottom: 2,
  },
  contact: {
    fontSize: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottom: "0.5px solid #ddd",
    paddingBottom: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  company: {
    fontSize: 10,
    fontWeight: "bold",
  },
  period: {
    fontSize: 10,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 10,
    marginBottom: 2,
  },
  link: {
    color: "#333",
    textDecoration: "none",
  },
  roleContainer: {
    marginBottom: 5,
  },
});

// Reusable Components
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionHeader}>{children}</Text>
);

const JobHeader = ({
  company,
  period,
}: {
  company: string;
  period: string;
}) => (
  <View style={styles.jobHeader}>
    <Text style={styles.company}>{company}</Text>
    <Text style={styles.period}>{period}</Text>
  </View>
);

const JobTitle = ({
  title,
  location,
}: {
  title: string;
  location?: string;
}) => (
  <Text style={styles.jobTitle}>
    {title}
    {location ? ` • ${location}` : ""}
  </Text>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.section}>{children}</View>
);

const BulletList = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletList}>{children}</View>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.bulletPoint}>• {children}</Text>
);

export const ResumePDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{resumeData.name}</Text>
        <Text style={styles.title}>{resumeData.title}</Text>
        <Text style={styles.contact}>
          {resumeData.contact.location} •{" "}
          <Link
            src={`https://${resumeData.contact.website}`}
            style={styles.link}
          >
            {resumeData.contact.website}
          </Link>
        </Text>
      </View>

      {/* Summary */}
      <Section>
        <SectionHeader>Summary</SectionHeader>
        <Text style={styles.bulletPoint}>{resumeData.summary}</Text>
      </Section>

      {/* Experience */}
      <Section>
        <SectionHeader>Experience</SectionHeader>

        {resumeData.experience.map((job) => (
          <View
            key={`${job.company}-${job.period}`}
            style={{ marginBottom: 8 }}
          >
            <JobHeader company={job.company} period={job.period} />

            {job.roles.map((role) => (
              <View
                key={`${role.title}-${role.period}`}
                style={styles.roleContainer}
              >
                <JobTitle title={role.title} />
                <Text style={styles.period}>{role.period}</Text>
                <BulletList>
                  {role.achievements.map((achievement, i) => (
                    <BulletPoint key={i}>{achievement}</BulletPoint>
                  ))}
                </BulletList>
              </View>
            ))}
          </View>
        ))}
      </Section>

      {/* Previous Experience */}
      <Section>
        <SectionHeader>Earlier Experience</SectionHeader>
        <BulletList>
          {resumeData.previousRoles.map((role, i) => (
            <BulletPoint key={i}>
              <Text style={{ fontWeight: "bold" }}>{role.title}</Text> at{" "}
              {role.company} ({role.period})
            </BulletPoint>
          ))}
        </BulletList>
      </Section>

      {/* Current Projects */}
      <Section>
        <SectionHeader>Current Projects</SectionHeader>
        <BulletList>
          {resumeData.currentProjects.map((project, i) => (
            <BulletPoint key={i}>
              <Text style={{ fontWeight: "bold" }}>{project.title}</Text> -{" "}
              {project.description}
            </BulletPoint>
          ))}
        </BulletList>
      </Section>

      {/* Skills */}
      <Section>
        <SectionHeader>Skills & Expertise</SectionHeader>
        <BulletList>
          {resumeData.skills.map((skill, i) => (
            <BulletPoint key={i}>
              <Text style={{ fontWeight: "bold" }}>{skill.category}: </Text>
              {skill.items.join(", ")}
            </BulletPoint>
          ))}
        </BulletList>
      </Section>
    </Page>
  </Document>
);
