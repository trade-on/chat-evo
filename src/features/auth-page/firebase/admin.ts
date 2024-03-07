import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
export const firebaseAdmin =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      type: process.env.FIREBASE_SECRET_TYPE,
      project_id: process.env.FIREBASE_SECRET_PROJECT_ID,
      private_key_id: process.env.FIREBASE_SECRET_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_SECRET_PRIVATE_KEY,
      client_email: process.env.FIREBASE_SECRET_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_SECRET_CLIENT_ID,
      auth_uri: process.env.FIREBASE_SECRET_AUTH_URI,
      token_uri: process.env.FIREBASE_SECRET_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_SECRET_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_SECRET_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_SECRET_UNIVERSE_DOMAIN,
    }),
  });

export const auth = getAuth();
