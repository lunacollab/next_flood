import { z } from "zod"

export const createArticleSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(255, "Tiêu đề quá dài"),
  summary: z.string().optional(),
  content: z.string().min(50, "Nội dung phải có ít nhất 50 ký tự"),
  category: z.string().min(1, "Danh mục không được để trống"),
  is_published: z.boolean().default(false).optional(),
})

export const updateArticleSchema = createArticleSchema.partial()

export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

