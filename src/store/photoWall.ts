import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
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
  const visible = ref(false);
  const photos = shallowRef<PhotoItem[]>([]);

  const saveMeta = () => {
    const meta: PhotoMeta[] = photos.value.map(({ id, x, y, rotation, scale, zIndex }) => ({
      id, x, y, rotation, scale, zIndex,
    }));
    setItem(TABLE, META_KEY, meta);
  };

  const toggle = () => {
    visible.value = !visible.value;
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
    saveMeta();
  };

  const removePhoto = (id: string) => {
    const photo = photos.value.find((p) => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }
    photos.value = photos.value.filter((p) => p.id !== id);
    deleteData(TABLE, id);
    saveMeta();
  };

  const updatePhoto = (id: string, changes: Partial<Omit<PhotoItem, "id" | "url">>) => {
    photos.value = photos.value.map((p) =>
      p.id === id ? { ...p, ...changes } : p
    );
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
    saveMeta();
  };

  const loadPhotos = async () => {
    const meta: PhotoMeta[] | undefined = await getItem(TABLE, META_KEY);
    if (!meta || !Array.isArray(meta)) return;

    const loaded: PhotoItem[] = [];
    for (const m of meta) {
      const file: File | undefined = await getItem(TABLE, m.id);
      if (file) {
        loaded.push({
          ...m,
          url: URL.createObjectURL(file),
        });
        if (m.zIndex > zCounter) zCounter = m.zIndex;
      }
    }
    photos.value = loaded;
  };

  loadPhotos();

  return {
    visible,
    photos,
    toggle,
    addPhoto,
    removePhoto,
    updatePhoto,
    bringToFront,
    resetLayout,
  };
});

export default usePhotoWall;
