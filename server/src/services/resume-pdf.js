const escapePdfText = (value = "") =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const chunkLines = (text, maxLength = 88) => {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

export const buildResumePdf = ({ portfolio, settings, projects = [] }) => {
  const title = portfolio?.heroTitle || settings?.siteName || "Portfolio Resume";
  const subtitle = portfolio?.heroSubtitle || "Full Stack Developer";
  const bio = portfolio?.bio || "Portfolio profile";
  const skills = Array.isArray(portfolio?.skills) ? portfolio.skills.join(", ") : "";
  const contact = [portfolio?.email || settings?.supportEmail, portfolio?.phone, portfolio?.location]
    .filter(Boolean)
    .join(" | ");
  const featuredProjects = projects.slice(0, 4).map((project) =>
    `${project.title}: ${project.excerpt || project.description || "Project summary unavailable."}`
  );

  const lines = [
    title,
    subtitle,
    contact,
    "",
    "Profile",
    ...chunkLines(bio),
    "",
    "Skills",
    ...chunkLines(skills || "Skills not configured yet."),
    "",
    "Selected Projects",
    ...(featuredProjects.length ? featuredProjects.flatMap((item) => chunkLines(item)) : ["No featured projects available yet."]),
  ];

  let y = 780;
  const commands = ["BT", "/F1 24 Tf", "50 800 Td"];

  lines.forEach((line, index) => {
    const fontSize = index === 0 ? 24 : index === 1 ? 14 : 11;
    if (index !== 0) {
      y -= index === 1 ? 26 : 16;
      commands.push("ET");
      commands.push("BT");
      commands.push(`/F1 ${fontSize} Tf`);
      commands.push(`50 ${y} Td`);
    }
    commands.push(`(${escapePdfText(line)}) Tj`);
  });

  commands.push("ET");
  const stream = commands.join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
};
