// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, "nepali_calendar/public/js/bs_converter.js"),
			name: "NepaliDateConverter",
			fileName: "bs_converter",
			formats: ["iife"], // Immediately Invoked Function Expression, good for browser use
		},
		outDir: "nepali_calendar/public/dist",
		emptyOutDir: true,
	},
});
