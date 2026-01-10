# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This project uses environment variables to configure the Firebase connection.

1.  Create a file named `.env` in the root of the project.
2.  Add your Firebase configuration keys to this file, prefixed with `NEXT_PUBLIC_`. For example:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    # ... and so on for all required Firebase config keys.
    ```

3.  **Important**: After creating or modifying the `.env` file, you must **restart the development server** for the changes to take effect.

## Local Development

The development server runs on port **9002**. You can access it at `http://localhost:9002`.

## Terminal Utilities

### Parsing JSON from API endpoints

To easily extract data from API endpoints in the terminal (e.g., for scripting or testing), you can pipe the `curl` output to Node.js.

**Example: Get the first portfolio slug**
```sh
# Fetch the slug from the diagnostic endpoint and parse it with Node.js
SLUG=$(curl -sS http://localhost:9002/api/diag/first-portfolio-slug | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).slug")
echo "Got slug: $SLUG"

# Use the slug to test the detail API
curl -i http://localhost:9002/api/public/portfolio/$SLUG
```
