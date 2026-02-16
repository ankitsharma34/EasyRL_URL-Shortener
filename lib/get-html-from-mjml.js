import fs from "fs/promises";
import ejs from "ejs";
import mjml2html from "mjml";
import path from "path";
export const getHTMLfromMJMLTemplate = async (template, data) => {
  // 1. read the mjml file
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", `${template}.mjml`),
    "utf-8",
  );
  // 2. replace the placeholder
  const filledTemplate = ejs.render(mjmlTemplate, data);
  // 3. convert to html
  return mjml2html(filledTemplate).html;
};
