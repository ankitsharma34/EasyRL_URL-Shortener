import z from "zod";

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email" })
    .max(100, { message: "Email must not be more than 100 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password must be no more that 100 characters" }),
});

export const registerUserSchema = loginUserSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100, { message: "Name must be no more than 100 characters" }),
});
