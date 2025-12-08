import { z } from "zod"

export const subscribeLocationSchema = z.object({
  location_id: z.number().int().positive("ID địa điểm không hợp lệ"),
  priority: z.number().int().min(1).max(5).default(1),
  notes: z.string().optional().or(z.literal("")),
})

export type SubscribeLocationInput = z.infer<typeof subscribeLocationSchema>

