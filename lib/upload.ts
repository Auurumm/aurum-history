import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

export async function uploadImage(file: File): Promise<string> {
  const filename = `${Date.now()}_${file.name}`
  const imageRef = ref(storage, `images/${filename}`)
  await uploadBytes(imageRef, file)
  return await getDownloadURL(imageRef)
}
