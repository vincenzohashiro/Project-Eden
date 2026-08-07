import { z } from 'zod'

const envSchema = z.object({
  PANEL_PORT: z.coerce.number().int().positive().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PTERODACTYL_PANEL_URL: z.string().url(),
  PTERODACTYL_API_KEY: z.string().min(1),
  PTERODACTYL_SERVER_ID: z.string().min(1),
  MC_RCON_HOST: z.string().min(1).default('127.0.0.1'),
  MC_RCON_PORT: z.coerce.number().int().positive().default(25575),
  MC_RCON_PASSWORD: z.string().min(1),
  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
})

export const config = envSchema.parse(process.env)
