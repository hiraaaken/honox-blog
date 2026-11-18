import { createClient } from "honox/client";

// 失敗しても SSR の描画は残るので、黙らせずにコンソールへ出すだけにする
createClient().catch((error: unknown) => {
  console.error("island のハイドレーションに失敗しました", error);
});
