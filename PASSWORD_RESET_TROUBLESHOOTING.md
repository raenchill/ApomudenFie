# 🔧 Password Reset Link Troubleshooting

## Common Issues & Solutions

### ❌ **Link Not Clickable**

**Problem**: The reset link in your email is not clickable or doesn't work.

**Solutions**:
1. **Copy and Paste**: Copy the entire URL from the email and paste it into your browser's address bar
2. **Check Email Client**: Some email clients block links - try opening the email in a different client
3. **Check Spam Folder**: Make sure the email isn't in your spam/junk folder
4. **Try Different Browser**: Use a different web browser (Chrome, Firefox, Safari, Edge)

### ❌ **Link Expired**

**Problem**: You get an error saying the link has expired.

**Solutions**:
1. **Request New Link**: Go back to the forgot password page and request a new reset link
2. **Check Time**: Reset links expire after 1 hour - make sure you're using it quickly
3. **Check Email**: Make sure you're using the most recent reset email

### ❌ **Invalid Link Error**

**Problem**: You get an "Invalid password reset link" error.

**Solutions**:
1. **Use Complete URL**: Make sure you're using the entire URL from the email
2. **Check for Typos**: Ensure there are no extra spaces or characters in the URL
3. **Request New Link**: If the link is corrupted, request a new one

### ❌ **Page Not Found**

**Problem**: You get a 404 error when clicking the link.

**Solutions**:
1. **Check URL**: Make sure the URL points to your app's domain
2. **Try Manual Navigation**: Go to your app's login page and click "Forgot password?"
3. **Contact Support**: If the issue persists, contact support

## Step-by-Step Guide

### **Method 1: Direct Link Click**
1. Open the password reset email
2. Click the reset link in the email
3. If it doesn't work, try Method 2

### **Method 2: Copy and Paste**
1. Open the password reset email
2. Right-click on the reset link and select "Copy link address"
3. Open your web browser
4. Paste the URL into the address bar
5. Press Enter

### **Method 3: Manual Navigation**
1. Go to your app's login page
2. Click "Forgot password?"
3. Enter your email address again
4. Request a new reset link

## Technical Details

### **How Reset Links Work**
- Firebase generates a secure, time-limited reset link
- The link contains an action code that's valid for 1 hour
- When clicked, it should redirect to your app's reset password page
- The action code is used to verify and complete the password reset

### **URL Formats**
Firebase can send reset links in these formats:
- `https://yourapp.com/reset-password?oobCode=ABC123...`
- `https://yourapp.com/__/auth/action?oobCode=ABC123...`
- `https://yourapp.com/reset-password#oobCode=ABC123...`

### **Browser Requirements**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled
- No popup blockers interfering

## Still Having Issues?

If you're still experiencing problems:

1. **Clear Browser Cache**: Clear your browser's cache and cookies
2. **Try Incognito Mode**: Open the link in an incognito/private window
3. **Check Network**: Ensure you have a stable internet connection
4. **Contact Support**: Provide the error message and steps you followed

## Security Notes

- Reset links are single-use only
- Links expire after 1 hour for security
- Never share reset links with others
- Always use HTTPS links for security

---

**Need Help?** Contact support with:
- Your email address
- The error message you're seeing
- Steps you've already tried
- Screenshots if possible 