# Google OAuth Setup Guide

This guide will walk you through setting up Google Sign-In for the Swaz Solutions application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

---

## Step 1: Access Google Cloud Console

1. Navigate to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account

---

## Step 2: Create or Select a Project

1. Click on the project dropdown at the top of the page
2. Either:
   - Click **"NEW PROJECT"** to create a new project
   - Or select an existing project

### If Creating a New Project:
1. Enter a **Project Name** (e.g., "Swaz Solutions")
2. Click **"CREATE"**
3. Wait for the project to be created (this may take a few seconds)

---

## Step 3: Navigate to Credentials

1. In the left sidebar, go to **APIs & Services** > **Credentials**
2. Or navigate directly to: https://console.cloud.google.com/apis/credentials

---

## Step 4: Configure OAuth Consent Screen

If this is your first time setting up OAuth, you'll need to configure the consent screen first.

1. Click **"OAuth consent screen"** in the left sidebar
2. Select **"External"** as the User Type
3. Click **"CREATE"**
4. Fill in the required information:
   - **App name**: `Swaz Solutions` (or your preferred name)
   - **User support email**: Select your email address
   - **Developer contact information**: Enter your email address
5. Click **"SAVE AND CONTINUE"**
6. On the **"Scopes"** page: Click **"SAVE AND CONTINUE"** (no changes needed)
7. On the **"Test users"** page: Click **"SAVE AND CONTINUE"** (optional to add test users)
8. Review the summary and click **"BACK TO DASHBOARD"**

---

## Step 5: Create OAuth Client ID

1. Go back to **"Credentials"** in the left sidebar
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Configure the OAuth Client:

1. **Application type**: Select **"Web application"**
2. **Name**: Enter `Swaz Solutions` (or your preferred name)

3. **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Add: `http://localhost:5173`

4. **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Add: `http://localhost:5173`

5. Click **"CREATE"**

---

## Step 6: Copy Your Credentials

After creating, a dialog will appear with your credentials:

1. **Copy the Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
2. **Copy the Client Secret** (looks like: `GOCSPX-abc123xyz`)

> **Important**: Keep these credentials secure! Don't commit them to public repositories.

---

## Step 7: Update Your .env File

1. Open your `.env` file in the project root
2. Add the following lines with your actual credentials:

```bash
# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

Replace:
- `YOUR_CLIENT_ID_HERE` with the Client ID you copied
- `YOUR_CLIENT_SECRET_HERE` with the Client Secret you copied

---

## Step 8: Rebuild the Application

After updating the `.env` file, rebuild your application:

```bash
npm run build
```

---

## Step 9: Test Google Sign-In

1. Start your development server (if not already running):
   ```bash
   npm run dev
   ```

2. Navigate to the registration page:
   - http://localhost:3000/#/register
   - Or the login page: http://localhost:3000/#/login

3. You should see a **"Sign in with Google"** button

4. Click the button and select your Google account

5. You should be:
   - Redirected to the application (usually `/studio`)
   - Logged in automatically
   - See a success toast message

---

## Troubleshooting

### Error: "Access blocked: Authorization Error - invalid_client"

**Cause**: The Client ID is incorrect or not properly configured.

**Solution**:
- Double-check that you copied the correct Client ID
- Verify the Client ID in your `.env` file matches the one in Google Cloud Console
- Make sure you rebuilt the app after updating `.env`

---

### Error: "Access blocked: Authorization Error - no registered origin"

**Cause**: The authorized origins are not configured in Google Cloud Console.

**Solution**:
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Verify that the following URIs are added under **"Authorized JavaScript origins"**:
   - `http://localhost:3000`
   - `http://localhost:5173`
4. Click **"SAVE"**
5. Wait 30-60 seconds for changes to propagate
6. Try again

---

### Google Sign-In Button Not Appearing

**Possible Causes**:
- The Google Sign-In script is blocked by browser extensions (ad blockers)
- Content Security Policy (CSP) is blocking the script
- Build is stale

**Solutions**:
1. **Hard refresh** the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. **Disable browser extensions** temporarily
3. **Check browser console** for errors:
   - Open Developer Tools (F12)
   - Check the Console tab for errors
4. **Rebuild the application**:
   ```bash
   npm run build
   ```

---

### Changes Not Taking Effect

If you update the `.env` file but don't see changes:

1. **Rebuild the frontend**:
   ```bash
   npm run build
   ```

2. **Restart the backend server**:
   - Stop the server (Ctrl+C)
   - Start it again: `npm run dev:backend`

3. **Clear browser cache** or use incognito mode

---

## Security Notes

### Production Setup

When deploying to production, you'll need to:

1. Create a new OAuth Client ID for production
2. Add your production domain to authorized origins:
   - `https://yourdomain.com`
3. Update your production `.env` file with the new credentials
4. Never commit `.env` files to version control
5. Use environment variables or secrets management in your hosting platform

### Best Practices

- ✅ Keep Client Secret secure
- ✅ Use different OAuth clients for development and production
- ✅ Add `.env` to `.gitignore`
- ✅ Regularly rotate credentials if compromised
- ❌ Never commit credentials to version control
- ❌ Never share credentials publicly

---

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Review the backend logs for authentication errors
3. Verify all configuration steps were followed correctly
4. Ensure your Google Cloud project is active and not suspended
