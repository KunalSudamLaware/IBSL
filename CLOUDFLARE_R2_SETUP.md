# Cloudflare R2 Setup Configuration

In order to permanently store uploads (like PDFs, DWGs) in production and prevent read-only filesystem errors (\EROFS\), you must ensure the following environment variables are properly configured in your production environment (e.g., Vercel):

\\\env
# The Cloudflare Account ID (find this on your Cloudflare R2 dashboard on the right sidebar)
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id_here"

# A newly generated R2 Token Access Key
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_here"

# The Secret Access Key for that token (Make sure the token has "Object Read & Write" permissions)
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_access_key_here"

# The name of the private bucket you created
CLOUDFLARE_R2_PRIVATE_BUCKET="morya-designs-private"
\\\

## Important Notes:
1. **Never** prefix these with \NEXT_PUBLIC_\. Doing so would expose your secure storage credentials to the client/browser.
2. In production, local storage fallbacks are now **strictly disabled**. If you do not configure R2 properly, uploading designs will safely abort with a clear error rather than crashing the application with a filesystem \EROFS\ error.
