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
