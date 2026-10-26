import firebaseConfig from "../../firebase-applet-config.json";

export type GoogleCloudPlatformStatus = {
  configured: boolean;
  provider: "google_cloud_firebase";
  projectId: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  authDomain: string;
  hostingRuntime: "google_cloud_run";
};

export function getGoogleCloudPlatformStatus(): GoogleCloudPlatformStatus {
  return {
    configured: Boolean(firebaseConfig.projectId && firebaseConfig.firestoreDatabaseId),
    provider: "google_cloud_firebase",
    projectId: firebaseConfig.projectId,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    storageBucket: firebaseConfig.storageBucket,
    authDomain: firebaseConfig.authDomain,
    hostingRuntime: "google_cloud_run",
  };
}
