import z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters long" })
  .max(100, { message: "Name must be no more than 100 characters" });

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email" })
  .max(100, { message: "Email must not be more than 100 characters." });
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password must be no more that 100 characters" }),
});

export const registerUserSchema = loginUserSchema.extend({
  name: nameSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().length(8),
  email: z.string().trim().email(),
});

export const verifyUserSchema = z.object({
  name: nameSchema,
});

export const verifyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, { message: "New Password must not more than 100 characters." }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must not more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password doesn't match!",
    path: ["confirmPassword"], //Error is associated with confirmPassword
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, { message: "New Password must not more than 100 characters." }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must not more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password doesn't match!",
    path: ["confirmPassword"], //Error is associated with confirmPassword
  });

export const verifyResetPasswordSchema = passwordSchema;
export const verifySetPasswordSchema = passwordSchema;
