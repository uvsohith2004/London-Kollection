import { defineConfig } from "tsup"
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths"

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["esm"],

  target: "node22",

  bundle: true,

  noExternal: ["@workspace/api-contracts"],

  splitting: false,

  sourcemap: false,

  clean: true,

  minify: true,

  dts: false,

  treeshake: true,

  esbuildPlugins: [TsconfigPathsPlugin({})],
})
