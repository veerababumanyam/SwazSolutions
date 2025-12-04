# SwazSolutions Constitution

## Core Principles

### I. Mobile-First (MUST - NON-NEGOTIABLE)
All user-facing features MUST prioritize mobile experience and achieve measurable mobile performance standards:
- Lighthouse mobile performance score: 90+ required for all public pages
- Page load time: < 2 seconds on 3G connection
- Touch targets: minimum 44x44px for all interactive elements
- Responsive design: Support viewport widths from 320px to 1920px
- No horizontal scrolling on any device size

**Rationale**: 70%+ of profile shares happen via mobile devices. Mobile-first ensures optimal experience for majority users.

### II. Privacy by Default (MUST - NON-NEGOTIABLE)
User privacy and data control are paramount:
- All profiles MUST be unpublished by default (explicit opt-in to make public)
- Contact information (email, phone) MUST be private unless explicitly marked public
- Analytics tracking MUST use anonymized methods (IP hashing, no third-party cookies)
- Search engine indexing MUST be opt-in (independent from publish toggle)
- GDPR/CCPA compliance required for all data collection

**Rationale**: Users must maintain control over their digital presence and personal information visibility.

### III. Performance Budget (MUST)
Strict performance constraints to ensure fast, responsive experience:
- Bundle size: < 200KB gzipped for initial load
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3s

**Enforcement**: Lighthouse audits required before each release. Performance degradation blocks deployment.

### IV. Accessibility First (MUST)
WCAG AA compliance is mandatory, not optional:
- All themes MUST meet WCAG AA contrast ratios (4.5:1 for text, 3:1 for UI components)
- Keyboard navigation MUST work for all interactive elements
- Screen reader compatibility required (NVDA, JAWS, VoiceOver tested)
- ARIA labels and semantic HTML mandatory
- Color cannot be sole indicator of state or meaning

**Rationale**: Digital profiles must be accessible to all users regardless of abilities.

### V. Progressive Enhancement
Core functionality MUST work without JavaScript; enhanced features gracefully degrade:
- Public profile viewing works with HTML/CSS only
- vCard download functions without client-side JavaScript
- No required dependencies on external services for core features (profile viewing, vCard)
- QR code generation can fail without breaking profile sharing

**Rationale**: Ensures maximum compatibility and reliability across devices and network conditions.

### VI. Test Coverage for User Flows (MUST)
Each user story MUST have independent test validation:
- All acceptance scenarios written before implementation
- E2E tests for critical flows (profile creation, vCard download, QR scanning)
- Mobile device testing on iOS and Android before release
- Cross-browser testing (Chrome, Safari, Firefox, Edge) required

**Rationale**: User stories define value; testing ensures value is delivered.

### VII. Simplicity Over Complexity
Start simple, add complexity only when justified:
- Single database table preferred over normalized splits unless performance requires it
- Custom analytics preferred over third-party service for MVP
- Manual theme selection before AI generation
- YAGNI principle: Implement what's specified, not what might be needed

**Rationale**: Reduces maintenance burden and speeds up initial delivery.

## Performance Standards

### Image Optimization (MUST)
All uploaded images MUST be optimized:
- Avatar: max 400x400px, compressed to < 100KB
- Background: max 1920x1080px, compressed with 85% quality
- Logo: max 512x512px, compressed to < 500KB
- Lazy loading required for non-critical images
- Responsive image sizes generated for mobile/tablet/desktop

### API Response Times
- Profile retrieval: p95 < 200ms
- vCard generation: p95 < 500ms
- QR code generation (cached): p95 < 100ms
- Theme application: p95 < 300ms

## Security Requirements (MUST)

### Input Validation
All user inputs MUST be validated:
- Username: alphanumeric + underscore/hyphen, 3-50 chars, unique
- URLs: HTTPS only, sanitized to prevent XSS
- File uploads: magic number validation, size limits enforced
- SQL injection prevention: parameterized queries only

### Rate Limiting
Abuse prevention MUST be implemented:
- File uploads: max 10 per hour per user
- AI theme generation: max 5 per hour per user
- Profile updates: max 20 per hour per user
- Analytics tracking: deduplication for unique visitors

### Authentication & Authorization
- Profile edit/delete: owner-only access verified
- Public routes: no authentication leakage
- CSRF protection on all state-changing operations

## Quality Gates

### Pre-Implementation Checklist
Before starting any feature:
- [ ] Spec.md exists with user stories and acceptance criteria
- [ ] Plan.md exists with technical approach and schemas
- [ ] Tasks.md exists with granular implementation steps
- [ ] Constitution compliance verified (run /speckit.analyze)

### Pre-Release Checklist
Before deployment:
- [ ] Lighthouse mobile score 90+ achieved
- [ ] Cross-browser testing complete
- [ ] Mobile device testing (iOS + Android) complete
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Security review complete (XSS, SQL injection, file upload)
- [ ] Performance budget met (bundle size, Core Web Vitals)

## Development Workflow

### Feature Development Process
1. **Specification Phase**: Create spec.md with user stories, requirements, edge cases
2. **Planning Phase**: Create plan.md with tech stack, schemas, API contracts
3. **Task Breakdown**: Create tasks.md with specific implementation steps
4. **Analysis Phase**: Run /speckit.analyze to validate consistency
5. **Implementation Phase**: Build features according to tasks, test continuously
6. **Validation Phase**: Run quality gates checklist before release

### Code Standards
- TypeScript for all new frontend code
- ESLint + Prettier for consistent formatting
- React functional components with hooks (no class components)
- Tailwind CSS utility classes (no custom CSS unless necessary)
- Meaningful variable/function names (no single letters except loop counters)

## Governance

### Constitution Authority
This constitution supersedes all other development practices. When conflicts arise:
1. Constitution principles take precedence
2. If principle needs to change, document reason and update constitution first
3. All feature specs must be validated against constitution before implementation

### Amendment Process
Constitution amendments require:
1. Written justification documenting why change is needed
2. Impact assessment on existing features
3. Update to all affected documentation (spec, plan, tasks)
4. Version increment and ratification date update

### Compliance Verification
- All feature specs MUST run /speckit.analyze before implementation
- Constitution violations are CRITICAL severity and block implementation
- Quality gates must pass before deployment
- Performance budgets enforced via CI/CD pipeline

---

**Version**: 1.0.0 | **Ratified**: December 2, 2025 | **Last Amended**: December 2, 2025
