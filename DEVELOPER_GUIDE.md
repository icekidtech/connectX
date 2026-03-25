# Developer Guide - Connect Platform

Quick reference for developers working on the platform.

## Project Command Reference

### Backend Commands

```bash
# Development
npm run start:dev          # Start with auto-reload
npm run build              # Build for production
npm run start:prod         # Run production build
npm run lint               # Check code quality
npm run format             # Format code

# Database
npm run migration:create   # Create new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Undo last migration

# Testing
npm run test               # Run unit tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
npm run test:e2e          # End-to-end tests
```

### Frontend Commands

```bash
# Development
npm run dev                # Start dev server (port 3000)
npm run build              # Build for production
npm run start              # Run production build
npm run lint               # Check code quality

# Analysis
npm run type-check         # TypeScript check
```

## Adding a New API Endpoint

### Step 1: Create Service Method

```typescript
// backend/src/modules/feature/feature.service.ts
@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private repository: Repository<Feature>,
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }
}
```

### Step 2: Add Controller Method

```typescript
// backend/src/modules/feature/feature.controller.ts
@Controller('feature')
@UseGuards(AuthGuard('jwt'))
export class FeatureController {
  constructor(private service: FeatureService) {}

  @Post()
  async create(@Body() dto: CreateFeatureDto) {
    return this.service.create(dto);
  }
}
```

### Step 3: Register in Module

```typescript
// backend/src/modules/feature/feature.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  providers: [FeatureService],
  controllers: [FeatureController],
})
export class FeatureModule {}
```

### Step 4: Import in App Module

```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    // ... other imports
    FeatureModule,
  ],
})
export class AppModule {}
```

## Creating Frontend Pages

### File Structure

```
app/feature/
├── page.tsx              # Main page component
├── layout.tsx            # Page layout (optional)
└── components/
    ├── feature-card.tsx
    └── feature-list.tsx
```

### Basic Page Template

```typescript
// app/feature/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function FeaturePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch data
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Feature</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Content */}
      </div>
    </main>
  );
}
```

## API Call Pattern

### Frontend API Service

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const data = await apiCall('/feature/list');
const created = await apiCall('/feature', {
  method: 'POST',
  body: JSON.stringify({ name: 'value' }),
});
```

## Error Handling Pattern

### Backend Error

```typescript
@Get(':id')
async get(@Param('id') id: string) {
  const item = await this.repository.findOne({ where: { id } });
  
  if (!item) {
    throw new NotFoundException(`Item with id ${id} not found`);
  }
  
  return item;
}
```

### Frontend Error

```typescript
'use client';

import { useState } from 'react';

export default function Component() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      const result = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!result.ok) {
        throw new Error('Request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded">
          {error}
        </div>
      )}
      {/* Form */}
    </>
  );
}
```

## Database Operations Pattern

### Creating Entity

```typescript
// Create
const user = this.repository.create({
  email: 'user@example.com',
  username: 'username',
});
await this.repository.save(user);
```

### Reading Entity

```typescript
// Find one
const user = await this.repository.findOne({
  where: { id },
  relations: ['profile', 'interests'],
});

// Find many
const users = await this.repository.find({
  where: { status: 'active' },
  skip: 0,
  take: 10,
  order: { createdAt: 'DESC' },
});
```

### Updating Entity

```typescript
// Update
await this.repository.update(
  { id },
  { email: 'new@example.com' }
);

// Or with entity
const user = await this.repository.findOne({ where: { id } });
user.email = 'new@example.com';
await this.repository.save(user);
```

### Deleting Entity

```typescript
await this.repository.delete({ id });
```

## Using Tailwind CSS

### Color Classes

```tsx
// Using design tokens (preferred)
<div className="bg-background text-foreground">
  Primary background with foreground text
</div>

<div className="bg-card text-card-foreground">
  Card background
</div>

<div className="bg-primary text-primary-foreground">
  Primary button
</div>

<div className="bg-accent text-accent-foreground">
  Accent element
</div>

<div className="text-muted-foreground">
  Muted text
</div>
```

### Common Patterns

```tsx
// Flex layout
<div className="flex items-center justify-between gap-4">
  Content
</div>

// Grid layout
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  Items
</div>

// Responsive spacing
<div className="px-4 py-8 sm:px-6 lg:px-8">
  Responsive padding
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive heading
</h1>

// Hover states
<button className="hover:bg-primary/10 transition">
  Hover effect
</button>
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request on GitHub

# After merge, update local
git checkout main
git pull origin main
```

## Debugging

### Backend Debugging

```typescript
// Console logging
console.log('[v0] Message:', variable);
console.error('[v0] Error:', error);

// Set breakpoint in VS Code
// Press F5 to debug with node --inspect-brk
```

### Frontend Debugging

```typescript
// Console logging
console.log('[v0] Message:', variable);

// React Developer Tools browser extension
// Check Components and Profiler tabs

// Network tab
// Check API calls and responses
```

## Performance Tips

### Frontend
- Use `React.memo()` for expensive components
- Lazy load images with `next/image`
- Code split with dynamic imports
- Use SWR for data fetching

### Backend
- Add database indexes on frequently queried columns
- Use pagination (skip/take)
- Cache with Redis
- Use eager loading for relations

## Testing

### Backend Unit Test

```typescript
// feature.service.spec.ts
describe('FeatureService', () => {
  let service: FeatureService;
  let repository: Repository<Feature>;

  beforeEach(async () => {
    // Setup test module
  });

  it('should create feature', async () => {
    const dto = { name: 'Test' };
    const result = await service.create(dto);
    expect(result.name).toBe('Test');
  });
});
```

### Frontend Component Test

```typescript
// component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=dating_platform
JWT_SECRET=very-long-random-secret-string
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_STREAMING=true
NEXT_PUBLIC_ENABLE_VERIFICATION=true
```

## Common Issues & Solutions

### TypeScript Errors
- Ensure types are properly imported
- Check `tsconfig.json` for path mappings
- Run `npm run type-check` to validate

### CORS Errors
- Check backend CORS configuration
- Ensure `FRONTEND_URL` is correct in `.env`
- Test with Postman first

### Database Errors
- Check PostgreSQL is running
- Verify connection string in `.env`
- Check if database exists
- Run `npm run migration:run` if needed

### Port Conflicts
- Change PORT in `.env` (backend)
- Kill existing process: `lsof -ti:3001 | xargs kill -9`

## Useful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Questions? Check README.md, SETUP.md, or PROJECT_SUMMARY.md**
