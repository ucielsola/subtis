import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "./routes/home.tsx"),
  route("/subtitles/movie/:slug", "./routes/subtitles.movie.$slug.tsx"),
  route("/subtitle/file/name/:bytes/:fileName", "./routes/subtitle.file.name.$bytes.$fileName.tsx"),
  route("/not-found/:bytes/:fileName", "./routes/not-found.$bytes.$fileName.tsx"),
  route("/faq", "./routes/faq.tsx"),
  route("/terms", "./routes/terms.tsx"),
  route("/search", "./routes/search.tsx"),
] satisfies RouteConfig;
