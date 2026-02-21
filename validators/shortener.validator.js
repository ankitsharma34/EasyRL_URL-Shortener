import z from "zod";
export const shortenerSchema = z.object({
  url: z
    .string({ required_error: "URL is required." })
    .trim()
    .url({ message: "Please enter a valid URL." })
    .max(1024, { message: "URL cannot be longer than 1024 characters" }),
  shortcode: z
    .string()
    .trim()
    .min(2, { message: "Short code must be at least 3 characters long." })
    .max(50, { message: "Short code cannot be longer than 50 characters." }),
});

export const shortenerSearchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .min(1)
    .optional() // optional must comes before default, otherwise default value would not be set
    .default(1) // if validation error occurs, then it will choose 1. It is necessary because, if the validation fails then error 500 will occur
    .catch(1),
});
