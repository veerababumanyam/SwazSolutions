# Cursor IDE – Selectable Elements (Login & Register)

These pages have **`data-testid`** and **`data-cursor-label`** on key elements so you can use **Cursor’s select button** (or visual editor) to identify and jump to the right component/code.

## Login page (`/login`)

| Element | `data-testid` | `data-cursor-label` |
|--------|----------------|----------------------|
| Page container | `login-page` | Login page container |
| Google Sign-In section | `google-signin-section` | Google Sign-In section |
| Google button container | `google-button-container` | Google button (Continue with Google) |
| Google OAuth button (GSI) | — | Google OAuth button |
| Fallback Google button | `google-button-fallback` | Continue with Google (fallback) |
| Login form | `login-form` | Login form (email/password) |
| Username/email input | `login-username` | Username or email input |
| Password input | `login-password` | Password input |
| Sign In button | `login-submit` | Sign In button |
| Link to Register | `login-signup-link` | Link to Register page |

**Input IDs:** `login-username-input`, `login-password-input` (for `<label htmlFor="...">`).

## Register page (`/register`)

| Element | `data-testid` | `data-cursor-label` |
|--------|----------------|----------------------|
| Page container | `register-page` | Register page container |
| Google Sign-Up section | `google-signup-section` | Google Sign-Up section |
| Google button container | `google-button-container` | Google button (Sign up with Google) |
| Google OAuth button (GSI) | — | Google OAuth button |
| Fallback Google button | `google-button-fallback` | Sign up with Google (fallback) |
| Registration form | `register-form` | Registration form |
| Username input | `register-username` | Username input |
| Email input | `register-email` | Email input |
| Password input | `register-password` | Password input |
| Create Account button | `register-submit` | Create Account button |
| Link to Login | `register-login-link` | Link to Login page |

**Input IDs:** `register-username-input`, `register-email-input`, `register-password-input`.

## How to use in Cursor

1. Open the app in **Cursor’s built-in browser** (e.g. Simple Browser or Preview).
2. Use **Cursor’s select / element picker** to click an element on the login or register page.
3. Cursor can use `data-testid` and `data-cursor-label` to map the selection to the right JSX in `LoginPage.tsx` or `RegisterPage.tsx`.
4. In tests or automation, target elements with `[data-testid="login-submit"]`, `[data-testid="google-button-container"]`, etc.

## Adding more pages

Use the same pattern on other pages:

- `data-testid="unique-id"` – stable ID for tests and tools.
- `data-cursor-label="Human-readable name"` – short description for Cursor’s UI.
- `id="...-input"` and `htmlFor="...-input"` on labels – for accessibility and label–input association.
