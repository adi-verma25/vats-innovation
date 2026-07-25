import { storage } from "../firebase/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

/**
 * Upload image to Firebase Storage
 * @param {File} file
 * @param {string} workOrderNumber
 * @param {"before"|"after"} type
 */
export async function uploadWorkOrderImage(
  file,
  workOrderNumber,
  type
) {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.name}`;

  const storageRef = ref(
    storage,
    `workOrders/${workOrderNumber}/${type}/${fileName}`
  );

  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  return url;
}