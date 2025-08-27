import { resolve } from "path";

export default {
  root: ".", // 프로젝트 루트
  build: {
    outDir: "assets/zif", // 빌드 산출물 위치
    emptyOutDir: true, // 매 빌드마다 비우기
    lib: {
      entry: resolve(__dirname, "zif/src/main.js"), // ✅ 진입 파일 정확히 지정
      formats: ["es"],
      fileName: () => "main.js", // /assets/zif/main.js 로 출력
    },
    rollupOptions: {
      output: {
        // CSS를 하나로 추출하려면 main.js에서 `import '../style.css'`를 추가하세요.
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "style.css"; // /assets/zif/style.css 로 출력
          }
          return assetInfo.name || "[name][extname]";
        },
      },
    },
  },
};
