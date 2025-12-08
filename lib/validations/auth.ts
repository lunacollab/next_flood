import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Nhập lại mật khẩu không được để trống"),
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(255, "Họ tên quá dài"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(20, "Số điện thoại quá dài").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(255, "Họ tên quá dài"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(20, "Số điện thoại quá dài").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Mật khẩu cũ không được để trống"),
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

