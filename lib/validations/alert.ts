import { z } from "zod"

export const createAlertSchema = z.object({
  location_id: z.number().int().positive("ID địa điểm không hợp lệ"),
  level: z.enum(["info", "warning", "danger", "critical"], {
    errorMap: () => ({ message: "Mức độ cảnh báo không hợp lệ" }),
  }),
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(255, "Tiêu đề quá dài"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  water_level: z.number().optional(),
  rainfall: z.number().optional(),
  wind_speed: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().int().min(0).max(100).optional(),
  forecast: z.string().optional(),
  safety_instructions: z.string().optional(),
})

export const updateAlertSchema = createAlertSchema.partial().extend({
  level: z.enum(["info", "warning", "danger", "critical"]).optional(),
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  is_active: z.boolean().optional(),
})

export type CreateAlertInput = z.infer<typeof createAlertSchema>
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>

