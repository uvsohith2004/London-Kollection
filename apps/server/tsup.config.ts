import { defineConfig } from "tsup";
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  esbuildPlugins: [TsconfigPathsPlugin({})],
});
