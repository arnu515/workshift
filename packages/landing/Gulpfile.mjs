// @ts-check

import g from "gulp";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import tw from "tailwindcss";
import concat from "gulp-concat";
import config from "./tailwind.config.mjs";
import imgmin from "gulp-imagemin";

export function css() {
  return g
    .src("styles/**/*.pcss")
    .pipe(postcss([tw({ ...config, darkMode: "media" }), autoprefixer(), cssnano()]))
    .pipe(concat("style.css"))
    .pipe(g.dest("dist/styles"));
}

export function html() {
  return g.src("src/**/*.html").pipe(g.dest("dist"));
}

export const assets = g.series(
  // images
  function images() {
    return g.src("assets/img/**/*.png").pipe(imgmin()).pipe(g.dest("dist/img"));
  }
);

export const main = g.series(css, assets, html);

export function dev() {
  return g.watch(["src/**/*.html", "styles/**/*.pcss"], main);
}

export default main;
