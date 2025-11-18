# GitHub Pages Deployment Guide

## Current Status

Your new website files are already in the `malbergo.github.io` repository. Now you need to ensure GitHub Pages is properly configured and push the DNS guide.

## Step-by-Step Deployment

### 1. Add and Commit the DNS Guide (Optional)

```bash
cd /Users/michaelalbergo/Documents/Documents_Mac/Resume/malbergo.github.io
git add DNS_FIX_GUIDE.md
git commit -m "Add DNS configuration guide"
git push origin master
```

### 2. Enable GitHub Pages

1. **Go to your repository settings:**
   - Visit: https://github.com/malbergo/malbergo.github.io/settings/pages

2. **Configure the source:**
   - **Source**: Deploy from a branch
   - **Branch**: `master` (or `main`)
   - **Folder**: `/ (root)`
   - Click **Save**

3. **Set custom domain:**
   - In the "Custom domain" field, enter: `malbergo.me`
   - Click **Save**
   - This will create/update the CNAME file (already exists)

4. **Wait for deployment:**
   - GitHub will show "Your site is ready to be published at https://malbergo.me"
   - After DNS propagates, it will change to "Your site is live at https://malbergo.me"

### 3. Enable HTTPS (After DNS Check Passes)

Once the DNS check is successful:
- Check the box: **Enforce HTTPS**
- This ensures all traffic uses secure HTTPS

## Verify Deployment

### Check Build Status

1. Go to the **Actions** tab in your repository:
   - https://github.com/malbergo/malbergo.github.io/actions

2. Look for "pages build and deployment" workflows
   - Green checkmark = successful deployment
   - Red X = deployment failed (check logs)

### Test Your Site

Once deployed, your site should be accessible at:
- https://malbergo.github.io (GitHub default URL)
- https://malbergo.me (after DNS is fixed)
- https://www.malbergo.me (after DNS is fixed)

## Current Blockers

### DNS Configuration Issue

Your custom domain `malbergo.me` won't work until you **update DNS records** at your domain registrar.

**See [DNS_FIX_GUIDE.md](DNS_FIX_GUIDE.md) for complete instructions.**

Quick summary:
1. Log into your domain registrar (Namecheap, GoDaddy, etc.)
2. Update A records to GitHub's current IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. Wait 15-60 minutes for DNS to propagate

## Deployment Checklist

- [ ] Commit any remaining changes
- [ ] Push to GitHub: `git push origin master`
- [ ] Go to Settings → Pages
- [ ] Verify source is set to `master` branch, `/ (root)` folder
- [ ] Verify custom domain is set to `malbergo.me`
- [ ] Check Actions tab for successful deployment
- [ ] Fix DNS records (see DNS_FIX_GUIDE.md)
- [ ] Wait for "DNS check successful" message
- [ ] Enable "Enforce HTTPS"
- [ ] Test site at malbergo.me

## Troubleshooting

### Site shows old content

**Clear browser cache:**
- Chrome/Edge: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Or do a hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### "404 - There isn't a GitHub Pages site here"

1. Check that GitHub Pages is enabled in Settings → Pages
2. Verify you're on the correct branch
3. Check Actions tab for deployment errors
4. Ensure repository is public (Settings → General)

### CSS/Images not loading

1. Verify file paths are relative (not absolute)
2. Check that files exist in the repository
3. Look for 404 errors in browser console (F12)

### Custom domain not working

1. Fix DNS records first (see DNS_FIX_GUIDE.md)
2. Wait for DNS propagation (up to 48 hours, usually 15-60 min)
3. Check dnschecker.org to see propagation status
4. Remove and re-add custom domain in GitHub settings if needed

## Quick Commands Reference

```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update website"

# Push to GitHub
git push origin master

# View remote URL
git remote -v

# Check which branch you're on
git branch
```

## GitHub Pages URLs

- **Repository Settings**: https://github.com/malbergo/malbergo.github.io/settings
- **Pages Settings**: https://github.com/malbergo/malbergo.github.io/settings/pages
- **Actions (Deployments)**: https://github.com/malbergo/malbergo.github.io/actions
- **Live Site (default)**: https://malbergo.github.io
- **Live Site (custom)**: https://malbergo.me (after DNS fix)

## Timeline

1. **Immediate** (0-5 min):
   - Push code to GitHub
   - Enable GitHub Pages in settings
   - Site deploys to malbergo.github.io

2. **After DNS Fix** (15-60 min):
   - Update DNS A records at registrar
   - DNS propagates globally
   - Custom domain malbergo.me works

3. **Final** (after DNS check succeeds):
   - Enable HTTPS enforcement
   - All traffic redirects to https://malbergo.me

---

**Note**: Your new website is already in the repository and ready to deploy. The main blocker is the DNS configuration for your custom domain.
