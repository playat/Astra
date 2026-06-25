import { defineStore } from "pinia";
import { shallowRef, triggerRef, ref } from "vue";
import { getItem, setItem, deleteData } from "@/utils/indexedDb";

export interface PhotoItem {
  id: string;
  url: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

interface PhotoMeta {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

const TABLE = "photoWall";
const META_KEY = "photos_metadata";

let zCounter = 1;

const usePhotoWall = defineStore("photoWall", () => {
  const editing = ref(false);
  const photos = shallowRef<PhotoItem[]>([]);

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const saveMeta = (immediate = false) => {
    if (!immediate) {
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        saveTimer = null;
        doSaveMeta();
      }, 300);
      return;
    }
    doSaveMeta();
  };

  const doSaveMeta = () => {
    const meta: PhotoMeta[] = photos.value.map(({ id, x, y, rotation, scale, zIndex }) => ({
      id, x, y, rotation, scale, zIndex,
    }));
    setItem(TABLE, META_KEY, meta);
  };

  const toggleEditing = () => {
    editing.value = !editing.value;
  };

  const addPhoto = async (file: File) => {
    const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await setItem(TABLE, id, file);

    const item: PhotoItem = {
      id,
      url: URL.createObjectURL(file),
      x: window.innerWidth / 2 - 100 + Math.random() * 100 - 50,
      y: window.innerHeight / 2 - 100 + Math.random() * 100 - 50,
      rotation: 0,
      scale: 1,
      zIndex: ++zCounter,
    };

    photos.value = [...photos.value, item];
    saveMeta(true);
  };

  const removePhoto = (id: string) => {
    const photo = photos.value.find((p) => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }
    photos.value = photos.value.filter((p) => p.id !== id);
    deleteData(TABLE, id);
    saveMeta(true);
  };

  const updatePhoto = (id: string, changes: Partial<Omit<PhotoItem, "id" | "url">>) => {
    const photo = photos.value.find((p) => p.id === id);
    if (!photo) return;
    Object.assign(photo, changes);
    triggerRef(photos);
    saveMeta();
  };

  const bringToFront = (id: string) => {
    updatePhoto(id, { zIndex: ++zCounter });
  };

  const resetLayout = () => {
    photos.value = photos.value.map((p, i) => ({
      ...p,
      x: window.innerWidth / 2 - 100 + (i % 4) * 120 - 180,
      y: window.innerHeight / 2 - 100 + Math.floor(i / 4) * 120 - 60,
      rotation: 0,
      scale: 1,
      zIndex: ++zCounter,
    }));
    saveMeta(true);
  };

  const loadPhotos = async () => {
    const meta: PhotoMeta[] | undefined = await getItem(TABLE, META_KEY);
    if (!meta || !Array.isArray(meta)) return;

    const loadedPhotos: PhotoItem[] = [];
    for (const m of meta) {
      const file: File | undefined = await getItem(TABLE, m.id);
      if (file) {
        loadedPhotos.push({
          ...m,
          url: URL.createObjectURL(file),
        });
        if (m.zIndex > zCounter) zCounter = m.zIndex;
      }
    }
    photos.value = loadedPhotos;
  };

  const dispose = () => {
    photos.value.forEach((p) => URL.revokeObjectURL(p.url));
    photos.value = [];
  };

  loadPhotos();

  return {
    editing,
    photos,
    toggleEditing,
    addPhoto,
    removePhoto,
    updatePhoto,
    bringToFront,
    resetLayout,
    dispose,
  };
});

export default usePhotoWall;
