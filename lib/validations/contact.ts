import { z } from "zod"

export const createContactSchema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(255, "Họ tên quá dài"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(20, "Số điện thoại quá dài"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  relationship: z.string().optional().or(z.literal("")),
  is_emergency: z.boolean(),
})

export const updateContactSchema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(255, "Họ tên quá dài"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(20, "Số điện thoại quá dài"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  relationship: z.string().optional().or(z.literal("")),
  is_emergency: z.boolean(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>

