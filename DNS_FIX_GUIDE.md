# DNS Configuration Fix Guide

## Problem
Your custom domain `malbergo.me` is showing "DNS check unsuccessful" in GitHub Pages settings because your A records point to **outdated GitHub Pages IP addresses**.

## Current DNS Configuration

### A Records (APEX domain: malbergo.me)
**Current (OUTDATED):**
- 192.30.252.153
- 192.30.252.154

**Should be:**
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

### CNAME Record (www subdomain)
**Current (CORRECT):**
- www.malbergo.me → malbergo.github.io

This is already correct! No changes needed.

---

## Solution: Update Your DNS Records

### Step 1: Log into Your Domain Registrar

You need to update DNS records at the service where you registered `malbergo.me` (e.g., Namecheap, GoDaddy, Google Domains, etc.).

### Step 2: Update A Records

1. **Delete** the old A records pointing to:
   - 192.30.252.153
   - 192.30.252.154

2. **Create** four new A records for `@` (apex domain) pointing to:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

### Step 3: Verify CNAME Record (should already exist)

Ensure you have a CNAME record:
- **Host:** `www`
- **Value:** `malbergo.github.io`

This is already configured correctly.

---

## Example DNS Configuration

Here's what your DNS records should look like at your registrar:

```
Type    Host    Value                   TTL
A       @       185.199.108.153         3600
A       @       185.199.109.153         3600
A       @       185.199.110.153         3600
A       @       185.199.111.153         3600
CNAME   www     malbergo.github.io      3600
```

---

## After Updating DNS

### 1. Wait for DNS Propagation
- DNS changes can take **up to 24-48 hours** to propagate fully
- Usually happens within **15 minutes to 1 hour** for most users
- You can check propagation at: https://dnschecker.org

### 2. Verify DNS Changes

Run these commands to verify:

```bash
# Check A records (should show new IPs)
dig malbergo.me A +short

# Check CNAME (should show malbergo.github.io)
dig www.malbergo.me CNAME +short
```

Expected output:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 3. GitHub Pages Settings

After DNS propagates:
1. Go to: https://github.com/malbergo/malbergo.github.io/settings/pages
2. The "DNS check successful" message should appear
3. Enable "Enforce HTTPS" (recommended)

---

## Testing Your Site

Once DNS propagates, your site should be accessible at:
- http://malbergo.me
- https://malbergo.me
- http://www.malbergo.me
- https://www.malbergo.me

All should redirect to the HTTPS version.

---

## Common Domain Registrars - Where to Update DNS

### Namecheap
1. Log in → Dashboard
2. Domain List → Manage
3. Advanced DNS tab
4. Add/Edit A records

### GoDaddy
1. Log in → My Products
2. DNS → Manage Zones
3. Edit A records for your domain

### Google Domains
1. Log in → My Domains
2. DNS → Custom records
3. Manage custom records

### Cloudflare (if using as DNS provider)
1. Log in → Select domain
2. DNS → Records
3. Edit A records

---

## Troubleshooting

### "DNS check unsuccessful" persists after 48 hours

1. **Remove and re-add custom domain in GitHub:**
   - Go to repository Settings → Pages
   - Remove custom domain (delete `malbergo.me` from field)
   - Save
   - Wait 1 minute
   - Re-add custom domain
   - Save

2. **Verify CNAME file:**
   ```bash
   cat CNAME
   # Should output: malbergo.me
   ```

3. **Check if CAA records are blocking:**
   ```bash
   dig malbergo.me CAA
   ```
   If you see CAA records, ensure they allow Let's Encrypt (for HTTPS).

### Site shows "404 - There isn't a GitHub Pages site here"

- Wait for DNS propagation
- Check that repository is public
- Verify GitHub Pages is enabled in Settings → Pages
- Ensure you're on the correct branch (master/main)

---

## Reference

- [GitHub Pages Custom Domain Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages IP Addresses](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)

---

## Quick Fix Checklist

- [ ] Log into domain registrar
- [ ] Delete old A records (192.30.252.153, 192.30.252.154)
- [ ] Add four new A records (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- [ ] Verify www CNAME exists (www → malbergo.github.io)
- [ ] Wait 15-60 minutes for DNS propagation
- [ ] Check GitHub Pages settings for "DNS check successful"
- [ ] Enable HTTPS enforcement
- [ ] Test site at malbergo.me

**Note:** The CNAME file in your repository is correct. This is purely a DNS registrar configuration issue.
