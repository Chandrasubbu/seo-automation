# SEO Projects - Quick Reference Card

## 📁 File Structure

```
/app
  /api
    /projects
      route.ts                    # GET all, POST create
      /[id]
        route.ts                  # GET, PUT, DELETE project
        /websites
          route.ts                # GET, POST, DELETE websites
  /projects
    page.tsx                       # Projects list page
    /[id]
      page.tsx                     # Project details page

/components
  ProjectManager.tsx              # Projects list component
  ProjectDetails.tsx              # Project details component

/prisma
  schema.prisma                    # Updated with new models

/docs
  PROJECTS_FEATURE.md             # Complete feature documentation
  IMPLEMENTATION_SUMMARY.md       # This summary
```

## 🗄️ Database Models

### SeoProject
```typescript
{
  id: string (CUID)
  userId: string (FK: User)
  name: string
  description?: string
  targetKeyword?: string
  clientUrl: string
  status: string ("active" | "inactive" | "archived")
  createdAt: DateTime
  updatedAt: DateTime
}
```

### SeoProjectWebsite
```typescript
{
  id: string (CUID)
  projectId: string (FK: SeoProject)
  url: string
  type: string ("competitor" | "reference" | "client")
  notes?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### SeoProjectAudit
```typescript
{
  id: string (CUID)
  projectId: string (FK: SeoProject)
  gapAnalysis?: Json
  recommendations?: Json
  topPriorities?: Json
  createdAt: DateTime
}
```

## 🔌 API Quick Reference

### Create Project
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "My Project",
  "description": "Client analysis",
  "targetKeyword": "best shoes",
  "clientUrl": "https://client.com",
  "websites": ["https://comp1.com", "https://comp2.com"]
}
```

### Get Projects
```bash
GET /api/projects

Response:
{
  "success": true,
  "projects": [...]
}
```

### Add Website
```bash
POST /api/projects/{projectId}/websites
Content-Type: application/json

{
  "url": "https://competitor.com",
  "type": "competitor",
  "notes": "Main competitor"
}
```

### List Websites
```bash
GET /api/projects/{projectId}/websites

Response:
{
  "success": true,
  "websites": [...],
  "total": 42
}
```

## 🎨 Component Props

### ProjectManager
```typescript
<ProjectManager />
// No props - fetches user's projects automatically
```

### ProjectDetails
```typescript
<ProjectDetails projectId="cuid123" />
```

## 🛣️ Navigation

Menu item added to AppSidebar:
```typescript
{ name: "Projects", href: "/projects", icon: Briefcase }
```

## 🔐 Authentication

All endpoints require NextAuth session:
```typescript
const session = await auth();
if (!session?.user?.email) {
  return 401 Unauthorized
}
```

## 🚀 Common Operations

### Create project with websites
1. POST `/api/projects` with websites array
2. All websites created in single transaction

### Add website after creation
1. POST `/api/projects/{id}/websites` with URL
2. Checks for duplicates
3. Returns error if exists

### Delete website
1. DELETE `/api/projects/{id}/websites`
2. Requires websiteId in body
3. Cascades properly

### Delete project
1. DELETE `/api/projects/{id}`
2. Cascades to all websites and audits
3. No orphaned data

## 📊 Capacity

- **Websites per project:** Unlimited (no hard limit)
- **Projects per user:** Unlimited
- **URL uniqueness:** Per project (same URL can be in different projects)
- **Storage:** Limited by database

## ⚡ Performance Tips

- Websites are indexed by projectId
- Use pagination in UI if > 50 websites
- Website list scrollable by default
- Indexes prevent N+1 queries

## 🐛 Error Handling

Common errors:
- `400` - Missing required fields
- `401` - Not authenticated
- `404` - Project/website not found
- `409` - Website already exists
- `500` - Server error

## 📱 UI Features

- Responsive grid layout
- Scrollable website list
- Form validation
- Loading states
- Error messages
- Success feedback

## 🔄 Data Flow

```
User → ProjectManager
      → Create Form
      → API POST /projects
      → Database Create
      → ProjectDetails
      → Add Website Form
      → API POST /websites
      → Database Insert
      → Update UI
```

## 🧪 Testing Checklist

- [ ] Create project with min info
- [ ] Add 40+ websites
- [ ] View all websites
- [ ] Add website via form
- [ ] Delete website
- [ ] Delete project
- [ ] API error handling
- [ ] Auth verification
- [ ] Mobile responsive

## 📚 Related Documentation

- [PROJECTS_FEATURE.md](PROJECTS_FEATURE.md) - Full feature guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
- [Prisma Schema](prisma/schema.prisma) - Database schema
- [README.md](README.md) - Main project README

## 🎯 Future Enhancements

- [ ] Bulk CSV import
- [ ] Website tagging
- [ ] Project templates
- [ ] Automated analysis
- [ ] Team collaboration
- [ ] Export/import
- [ ] Advanced filtering
- [ ] API documentation

---

**Last Updated:** January 9, 2026
**Version:** 1.0
**Status:** Production Ready ✅
