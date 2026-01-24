import { defineConfig } from "tsup";


export default defineConfig({
    entry: {
        "index": "src/index.ts",
        "ConnectButton": "src/components/ConnectButton/index.ts",
        "WalletModal": "src/components/WalletModal/index.ts",
        "WalletDropdown": "src/components/WalletDropdown/index.ts"
    },
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    minify: false,
    clean: true,
    external: [
        "react",
        "react-icons",
        "react-dom",
        "@solana/connector"
    ],

    injectStyle: false,
    banner: {
        js: '"use client";',
    },
    loader: {
        ".css": "copy",
    }
});