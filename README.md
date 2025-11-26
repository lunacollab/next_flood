# Hệ thống cảnh báo lũ lụt - Frontend

Frontend được xây dựng với Next.js 16, TypeScript, shadcn-ui, Zustand và Zod.

## 🚀 Tính năng

- ✅ Next.js 16 với App Router
- ✅ TypeScript
- ✅ shadcn-ui components
- ✅ Zustand cho state management
- ✅ Zod cho validation
- ✅ Responsive design
- ✅ Authentication với JWT
- ✅ Real-time notifications (Pusher)
- ✅ Form validation với react-hook-form

## 📦 Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

3. Cập nhật các biến môi trường trong `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_UPLOADS_URL=http://localhost:8080/uploads
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

## 🏃 Chạy ứng dụng

### Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📁 Cấu trúc thư mục

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── dashboard/         # Dashboard page
│   ├── alerts/            # Alerts listing page
│   ├── locations/        # Locations page
│   ├── contacts/         # Contacts page
│   ├── articles/         # Articles page
│   └── profile/          # Profile page
├── components/           # React components
│   ├── ui/               # shadcn-ui components
│   ├── layout/           # Layout components (Header, Footer)
│   └── auth/             # Auth components
├── lib/                  # Utilities và helpers
│   ├── api-client.ts     # Axios client
│   ├── constants.ts      # Constants
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Utility functions
│   └── validations/      # Zod schemas
├── store/                # Zustand stores
│   ├── auth-store.ts     # Auth state
│   ├── alert-store.ts    # Alert state
│   ├── location-store.ts # Location state
│   ├── contact-store.ts  # Contact state
│   └── notification-store.ts # Notification state
└── public/               # Static files
```

## 🔧 Công nghệ sử dụng

- **Next.js 16**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn-ui**: UI components
- **Zustand**: State management
- **Zod**: Schema validation
- **react-hook-form**: Form handling
- **Axios**: HTTP client
- **Pusher**: Real-time notifications
- **date-fns**: Date formatting

## 📝 API Integration

Frontend kết nối với backend Go qua REST API. Tất cả API calls được xử lý qua `lib/api-client.ts` với:
- Automatic token injection
- Error handling
- Request/Response interceptors

## 🎨 UI Components

Sử dụng shadcn-ui với các components:
- Button
- Input
- Card
- Badge
- Alert
- Label
- Và nhiều components khác...

## 🔐 Authentication

- JWT token được lưu trong localStorage
- Automatic token refresh
- Protected routes
- Role-based access (user/admin)

## 📱 Responsive Design

Ứng dụng được thiết kế responsive cho:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình environment variables
4. Deploy!

### Docker

```bash
docker build -t flood-warning-frontend .
docker run -p 3000:3000 flood-warning-frontend
```

## 📄 License

MIT
