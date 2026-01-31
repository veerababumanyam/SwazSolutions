# VCardPanel Architecture Diagrams

## Component Hierarchy

```
App.tsx
└── Router
    └── Routes
        └── /profile
            └── VCardPanel (page)
                └── ProfileProvider (context wrapper)
                    └── VCardPanelContent (inner component)
                        └── VCardEditorLayout (split-screen layout)
                            ├── TabNavigation (tabs)
                            │   ├── Portfolio Tab Button
                            │   ├── Aesthetics Tab Button
                            │   └── Insights Tab Button
                            │
                            ├── EditorPane (left side, scrollable)
                            │   ├── TabNavigation
                            │   └── EditorPaneContent
                            │       ├── PortfolioTab (placeholder)
                            │       ├── AestheticsTab (placeholder)
                            │       └── InsightsTab (placeholder)
                            │
                            ├── PreviewPane (right side, sticky)
                            │   ├── Toggle Button (mobile only)
                            │   └── MobilePreview (live device preview)
                            │
                            └── GlobalSaveBar (sticky bottom)
                                ├── Status Display
                                ├── Cancel Button
                                ├── Publish Button
                                └── Save Button
```

## State Flow

```
VCardPanel (Page Level)
│
├── Tab State
│   └── activeTab: 'portfolio' | 'aesthetics' | 'insights'
│       └── onTabChange() → updates activeTab
│           └── triggers EditorPaneContent re-render
│               └── smooth animation (Framer Motion)
│
├── Unsaved Changes Tracking
│   └── hasUnsavedChanges: boolean
│       ├── Updated by useEffect on profile/links/theme change
│       ├── Shown as indicator on active tab
│       ├── Triggers browser warning on close
│       └── Disables save button when false
│
├── Save State
│   └── saveState: { lastSavedAt, lastSavedProfile, lastSavedLinks, lastSavedTheme }
│       ├── Initialized on component mount
│       ├── Updated after successful save/publish
│       ├── Used for change detection
│       └── Used to revert on cancel
│
└── ProfileContext (from parent provider)
    ├── profile: ProfileData
    ├── links: LinkItem[]
    ├── theme: Theme
    ├── updateProfile(): Promise<void>
    ├── updateLink(): Promise<void>
    ├── reorderLinks(): Promise<void>
    ├── setTheme(): Promise<void>
    ├── publishProfile(): Promise<void>
    └── (other mutations...)
```

## Data Flow Diagram

```
User Action
│
├── Edit Profile Field
│   └── updateProfile() [ProfileContext]
│       └── Updates profile state
│           └── VCardPanel detects change
│               ├── Sets hasUnsavedChanges = true
│               └── PreviewPane re-renders with new data
│                   └── MobilePreview updates
│
├── Switch Tab
│   └── onTabChange(newTab)
│       └── Updates activeTab
│           └── EditorPaneContent swaps content
│               └── Framer Motion animation
│
├── Click Save
│   └── handleSave()
│       ├── setIsSaving(true)
│       ├── await onSave() [API call - TODO]
│       ├── Updates saveState
│       ├── setHasUnsavedChanges(false)
│       └── setIsSaving(false)
│           └── SaveBar status updates
│
├── Click Cancel
│   └── handleCancel()
│       ├── Shows confirmation dialog
│       ├── If confirmed, reverts to lastSaved state
│       ├── Resets hasUnsavedChanges
│       └── Navigates to /profile/dashboard
│
└── Click Publish
    └── handlePublish(true)
        ├── setIsPublishing(true)
        ├── await onPublish(true) [API call - TODO]
        ├── Updates saveState
        ├── setHasUnsavedChanges(false)
        └── setIsPublishing(false)
            └── Shows success indicator
```

## Responsive Layout Breakpoints

### Desktop Layout (1280px+)

```
┌──────────────────────────────────────────────────┐
│ Header                                           │
├──────────────────────────────────────────────────┤
│
│  Profile Editor
│
│  ┌─────────────────────────┬─────────────────┐
│  │                         │                 │
│  │   Editor Pane (60%)     │  Preview (40%)  │
│  │                         │  (sticky)       │
│  │   ┌──────────────────┐  │                 │
│  │   │ Tab Navigation   │  │ Mobile Device   │
│  │   ├──────────────────┤  │ Preview         │
│  │   │ Portfolio        │  │                 │
│  │   │ Content Area     │  │                 │
│  │   │ (scrollable)     │  │                 │
│  │   │                  │  │                 │
│  │   └──────────────────┘  │                 │
│  │                         │                 │
│  └─────────────────────────┴─────────────────┘
│
├──────────────────────────────────────────────────┤
│ Save Bar: [Status] [Cancel] [Publish] [Save]   │
├──────────────────────────────────────────────────┤
│ Footer (optional)                                │
└──────────────────────────────────────────────────┘

CSS Grid: grid-cols-[1fr_480px] gap-6
Max Width: 7xl (80rem)
```

### Tablet Layout (768-1279px)

```
┌──────────────────────────────────────────────────┐
│ Header                                           │
├──────────────────────────────────────────────────┤
│
│  Profile Editor
│
│  ┌──────────────────┬──────────────────┐
│  │                  │                  │
│  │   Editor (50%)   │  Preview (50%)   │
│  │                  │  (sticky)        │
│  │   Tab Nav        │                  │
│  │   Content        │  Mobile Preview  │
│  │   (scrollable)   │                  │
│  │                  │                  │
│  └──────────────────┴──────────────────┘
│
├──────────────────────────────────────────────────┤
│ Save Bar: [Status] [Cancel] [Publish] [Save]   │
├──────────────────────────────────────────────────┤
│ Footer (optional)                                │
└──────────────────────────────────────────────────┘

CSS Grid: grid-cols-2 gap-6
```

### Mobile Layout (<768px)

```
┌────────────────────────────────┐
│ Header                         │
├────────────────────────────────┤
│
│  Profile Editor
│
│  ┌──────────────────────────┐
│  │ Tab Navigation           │
│  ├──────────────────────────┤
│  │                          │
│  │ Portfolio Editor Content │
│  │ (scrollable)             │
│  │                          │
│  └──────────────────────────┘
│
│  ┌──────────────────────────┐
│  │ [Show Preview]    ▼      │
│  ├──────────────────────────┤
│  │                          │
│  │ Mobile Preview (if shown)│
│  │                          │
│  └──────────────────────────┘
│
├────────────────────────────────┤
│ Save Bar (condensed):          │
│ [Status] [Save]                │
├────────────────────────────────┤
│ Footer (optional)              │
└────────────────────────────────┘

CSS: flex flex-col
Preview: Toggle expand/collapse with ChevronDown/Up
```

## Event Flow & Handlers

```
User Interaction                 Component              State Update           UI Update
─────────────────                ──────────            ─────────────          ─────────

Click Tab Button            →   onTabChange()   →   activeTab = 'aesthetics'  →   EditorPaneContent
                                                                                    switches tab

Type in Profile Field       →   updateProfile()  →   profile = {...}  →   VCardPanel detects
(ProfileContext mutation)       [auto by context]     hasUnsavedChanges = true    change indicator

                                                                          PreviewPane
                                                                          updates preview

Click Save Button           →   handleSave()    →   isSaving = true  →   GlobalSaveBar
                                                     saveState = {...}   shows loading

                                                    isSaving = false →   Status updates
                                                    hasUnsavedChanges = false

Click Cancel Button         →   handleCancel()  →   Shows confirm  →   If confirmed:
                                                     dialog            revert state
                                                                       navigate away

Click Publish Button        →   handlePublish() →   isPublishing = true  →   GlobalSaveBar
                                                     (same as save)       shows loading
```

## Change Detection Algorithm

```
useEffect(() => {
  const profileChanged = JSON.stringify(profile) !==
                         JSON.stringify(saveState.lastSavedProfile)

  const linksChanged = JSON.stringify(links) !==
                       JSON.stringify(saveState.lastSavedLinks)

  const themeChanged = JSON.stringify(theme) !==
                       JSON.stringify(saveState.lastSavedTheme)

  const hasChanges = profileChanged || linksChanged || themeChanged

  setHasUnsavedChanges(hasChanges)

}, [profile, links, theme, saveState])

// Dependency array triggers check whenever any context value changes
// Comparison uses JSON.stringify for deep equality
// Works across all 3 domains: profile, links, theme
```

## Type System

```
TabId = 'portfolio' | 'aesthetics' | 'insights'

VCardEditorLayoutProps = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  hasUnsavedChanges: boolean
  onUnsavedChange: (hasChanges: boolean) => void
  profile: ProfileData | null
  links: LinkItem[]
  theme: Theme
  lastSavedAt: Date | null
  onSave: () => Promise<void>
  onCancel: () => void
  onPublish: (published: boolean) => Promise<void>
}

SaveState = {
  lastSavedAt: Date | null
  lastSavedProfile: any
  lastSavedLinks: any
  lastSavedTheme: any
}
```

## Async Operations Timeline

```
Save Operation:
└── Click Save Button
    ├── setIsSaving(true)           [UI: show spinner]
    ├── await onSave()              [API call - 500ms-2s]
    │   └── POST /api/profile/save
    │       └── Returns success
    ├── setSaveState(current)       [update timestamps]
    ├── setHasUnsavedChanges(false)
    ├── setIsSaving(false)          [UI: hide spinner]
    └── SaveBar status: "Saved now"

Publish Operation:
└── Click Publish Button
    ├── setIsPublishing(true)       [UI: show spinner]
    ├── await onPublish(true)       [API call - 500ms-2s]
    │   └── POST /api/profile/publish
    │       └── Returns success
    ├── setSaveState(current)       [update timestamps]
    ├── setHasUnsavedChanges(false)
    ├── setIsPublishing(false)      [UI: hide spinner]
    └── SaveBar status: "Published"
```

## Keyboard Navigation Flow

```
Tab Navigation
──────────────
Tab            →  Move focus to next interactive element
Shift+Tab      →  Move focus to previous interactive element
Enter          →  Activate focused button/tab
Escape         →  Close modals (when added)

Focus Order (Top to Bottom):
1. Tab Navigation Buttons (Portfolio, Aesthetics, Insights)
2. Content in Active Tab (any interactive elements)
3. Preview Toggle (mobile only)
4. Save Bar Buttons (Cancel, Publish, Save)

All elements have focus:ring-2 visible indicator
```

## Error Handling Flow

```
Try to Save
│
├── Error: Network Failure
│   └── catch(error)
│       ├── setIsSaving(false)
│       ├── console.error()
│       ├── TODO: Show Toast Error
│       └── State reverts (no saveState update)
│
├── Error: Validation Failed
│   └── catch(error)
│       ├── setIsSaving(false)
│       ├── TODO: Show Toast Error
│       └── State reverts
│
└── Success
    └── updateSaveState()
        └── setHasUnsavedChanges(false)
```

## Browser Warning Implementation

```
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ''  // Show browser's default dialog
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [hasUnsavedChanges])

// Browser shows: "You have unsaved changes. Leave site?"
// [Stay on Page] [Leave Page]
```

## CSS Responsive Behavior

```
Breakpoints:
└── mobile: max-w-none, stacked layout
└── sm: (640px+) padding adjustments
└── md: (768px+) tablet layout starts
└── lg: (1024px+) padding increases
└── xl: (1280px+) desktop layout starts
└── 2xl: (1536px+) max content width

Dark Mode Toggle:
└── dark: prefix applies dark theme
└── Uses system preference via tailwind config
└── Can be overridden with manual toggle (future)

Sticky Positioning:
└── Desktop/Tablet: preview pane sticky top-24
└── Mobile: preview pane fixed bottom with expand/collapse
└── Save bar: fixed bottom-0 z-40
```

---

**Visual Architecture Document**
**Phase 2 - Container & Layout**
**Ready for Implementation**
