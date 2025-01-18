import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
    plugins: [preact()],
    css: {
        postcss: "./postcss.config.js",
    },
    define: {
        "import.meta.env.VITE_HTTP_API_URL": JSON.stringify(
            "https://ckb-tx-elevator-api.ckbapp.dev", //"http://13.251.229.198:3000", //"http://localhost:3000",
        ),
        "import.meta.env.VITE_WS_API_URL": JSON.stringify(
            "ws://localhost:3000", //"http://13.251.229.198:3000", //"http://localhost:3000",
        ),
    },
});
