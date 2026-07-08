# Next.js Magazine CMS — JavaScript + MongoDB Ready

Clean JavaScript project using Next.js App Router, shadcn/ui, Tailwind CSS, and MongoDB-ready data access. This version has no TypeScript, no Prisma, no Redux, and no unnecessary extra project structure.

## Included

- Next.js App Router project in plain `.js` / `.jsx`
- shadcn/ui components kept
- MongoDB support using Mongoose only
- Built-in seed database fallback when `MONGODB_URI` is empty
- 6 categories with minimum 12 demo posts in each category
- Single post URL format: `/{post-slug}` instead of `/article/{post-slug}`
- No Prisma
- No Redux
- Staff login for admin/writer
- Reader demo login flow
- Dashboard for articles, categories, users, comments, and profile
- BlockNote-compatible content structure with lightweight editor
- Cloudinary upload support when env vars are configured; URL fallback works without Cloudinary

## Removed

- Prisma folder and Prisma scripts
- TypeScript config and `.ts/.tsx` source files
- Redux/extra state-management setup
- Extra sandbox folders/files from the previous generated project
- Unused dependencies like Prisma, next-auth, next-intl, TanStack, Zustand, MDX editor, and z-ai SDK

## Environment

By default, MongoDB is disabled and the project uses built-in seed data so it can run immediately.

```env
# Leave empty to use built-in seed data.
# Add your MongoDB URL when you are ready to use real database storage.
MONGODB_URI=

APP_URL=http://localhost:3000
AUTH_SECRET=bangladeshist-magazine-dev-secret-change-me

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

When you are ready for MongoDB Atlas or local MongoDB, add the URL:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/magazine_js?retryWrites=true&w=majority
```

or local MongoDB:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/magazine_js
```

## Login

Staff login page: `/admin-login`

```txt
admin@example.com / 12345678
writer@example.com / 12345678
```

Reader demo login page: `/login`

## Run

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Notes

Without `MONGODB_URI`, seed data is kept in memory while the dev server is running. Once you add a MongoDB URL, the same seed data will be inserted into MongoDB automatically when the database is empty.
