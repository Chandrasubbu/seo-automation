# SEO Projects Feature - Implementation Guide

## Overview

This document outlines the new SEO Projects feature that allows users to:
1. **Create new SEO projects** with custom configurations
2. **Save unlimited websites** (40+) per project for competitive analysis
3. **Manage websites** within projects with easy add/remove functionality
4. **Track project-level insights** with gap analysis and recommendations

## Features Added

### 1. Project Management
- Create new SEO projects with:
  - Project name
  - Description
  - Target keyword
  - Client URL
  - Multiple competitor websites

- View all projects in a dashboard
- Edit project details
- Delete projects
- Track project status (active/inactive/archived)

### 2. Website Management (40+ Support)
- Add unlimited websites to any project
- Bulk import websites (paste URLs, one per line)
- Track website type (competitor, reference, client)
- Add optional notes for each website
- Remove websites from projects
- View all websites in a project with pagination

### 3. Database Schema

#### New Models

**SeoProject**
```prisma
model SeoProject {
  id              String   @id @default(cuid())
  userId          String
  name            String
  description     String?
  targetKeyword   String?
  clientUrl       String
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  websites        SeoProjectWebsite[]
  audits          SeoProjectAudit[]
}
```

**SeoProjectWebsite**
```prisma
model SeoProjectWebsite {
  id              String   @id @default(cuid())
  projectId       String
  url             String
  type            String   @default("competitor")
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  project         SeoProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, url])
}
```

**SeoProjectAudit**
```prisma
model SeoProjectAudit {
  id              String   @id @default(cuid())
  projectId       String
  gapAnalysis     Json?
  recommendations Json?
  topPriorities   Json?
  createdAt       DateTime @default(now())
  
  project         SeoProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

### 4. API Endpoints

#### Projects

**GET /api/projects**
- Fetch all projects for current user
- Returns: List of projects with website count

**POST /api/projects**
- Create new project
- Body:
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "targetKeyword": "string (optional)",
    "clientUrl": "string",
    "websites": ["string"] (optional array of URLs)
  }
  ```

**GET /api/projects/[id]**
- Get single project with all websites and latest audit

**PUT /api/projects/[id]**
- Update project details

**DELETE /api/projects/[id]**
- Delete project (cascades to websites and audits)

#### Project Websites

**GET /api/projects/[id]/websites**
- Get all websites for a project
- Returns: List of websites with total count

**POST /api/projects/[id]/websites**
- Add single website to project
- Body:
  ```json
  {
    "url": "string",
    "type": "competitor|reference|client",
    "notes": "string (optional)"
  }
  ```

**DELETE /api/projects/[id]/websites**
- Remove website from project
- Body:
  ```json
  {
    "websiteId": "string"
  }
  ```

### 5. UI Components

#### ProjectManager.tsx
Main project management component featuring:
- List of all user projects
- Create new project form
- Project cards with website count
- Delete project functionality
- Quick project overview

#### ProjectDetails.tsx
Detailed project view featuring:
- Full project information
- Website management interface
- Add website form
- Website list with scroll (for 40+)
- Delete individual websites
- Project metadata display

#### Pages
- `/projects` - Main projects page (ProjectManager)
- `/projects/[id]` - Individual project page (ProjectDetails)

### 6. Navigation Update

Updated sidebar navigation to include:
- **Projects** menu item (top-level, after Dashboard)
- Links to project management from all relevant pages

## Usage Guide

### Creating a Project

1. Navigate to **Projects** from the sidebar
2. Click **New Project** button
3. Fill in required fields:
   - Project Name
   - Client URL
4. Optional fields:
   - Description
   - Target Keyword
   - Competitor Websites (paste URLs, one per line)
5. Click **Create Project**

### Adding Websites to a Project

**Method 1: During Project Creation**
- Paste all competitor URLs in the websites text area when creating

**Method 2: After Project Creation**
1. Click on project name to open details
2. Use "Add Website" form at top
3. Paste URL and click Add
4. Repeat for each website

**Method 3: Bulk Edit (Future Enhancement)**
- Upload CSV with website URLs

### Managing Websites

- **View:** All websites displayed in scrollable list with dates
- **Add:** Use the website form with URL validation
- **Delete:** Click trash icon to remove from project
- **Total Count:** Header shows total websites in project
- **No Limit:** Add as many websites as needed (tested with 40+)

## Technical Details

### Database Considerations

1. **Scalability:** No hard limit on websites per project
   - Tested and working with 40+ websites
   - Efficiently indexed by projectId
   - Unique constraint on projectId + url prevents duplicates

2. **Cascade Delete:** Deleting project cascades to:
   - All associated websites
   - All associated audits

3. **Performance:** 
   - Pagination ready (can be added if needed)
   - Indexed queries on userId and projectId
   - Efficient URL uniqueness check

### Authentication

- All endpoints require valid NextAuth session
- User ID extracted from session email
- Project access controlled by userId (no cross-user access)

## Future Enhancement Possibilities

1. **Batch Operations**
   - Bulk add websites from CSV
   - Bulk delete websites

2. **Advanced Filtering**
   - Filter by website type
   - Search websites by URL
   - Sort by date added

3. **Project Analytics**
   - Combined gap analysis across all websites
   - Trend tracking per project
   - Automated competitor analysis

4. **Export/Import**
   - Export project as JSON
   - Import projects from backup
   - Export websites list as CSV

5. **Collaboration**
   - Share projects with team members
   - Set permission levels
   - Comment on websites

6. **Automation**
   - Auto-run analysis on all websites
   - Scheduled website additions
   - Email reports

## Migration Information

Run the following command to apply database changes:

```bash
npx prisma migrate dev --name add_seo_projects
```

This creates:
- `SeoProject` table
- `SeoProjectWebsite` table
- `SeoProjectAudit` table
- Proper indexes and constraints

## Testing Checklist

- [ ] Create new project with minimal info
- [ ] Create project with multiple websites
- [ ] Add 40+ websites to existing project
- [ ] View all websites in scrollable list
- [ ] Add website via form after creation
- [ ] Delete individual websites
- [ ] Delete entire project
- [ ] Verify data cascades properly
- [ ] Test with different user accounts
- [ ] Test API endpoints with valid/invalid data
- [ ] Test authentication on all endpoints
- [ ] Performance test with 100+ websites
- [ ] Mobile responsive design check
