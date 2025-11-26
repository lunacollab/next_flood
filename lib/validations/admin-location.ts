import { z } from "zod"

export const createLocationSchema = z.object({
  name: z.string().min(2, "Tên địa điểm phải có ít nhất 2 ký tự").max(255, "Tên địa điểm quá dài"),
  province: z.string().min(1, "Tỉnh/thành phố không được để trống"),
  district: z.string().optional(),
  ward: z.string().optional(),
  latitude: z.number().min(-90).max(90, "Vĩ độ không hợp lệ"),
  longitude: z.number().min(-180).max(180, "Kinh độ không hợp lệ"),
  description: z.string().optional(),
  is_monitoring: z.boolean(),
})

export const updateLocationSchema = createLocationSchema.partial()

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

