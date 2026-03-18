import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { ChangelogPage } from "./pages/ChangelogPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: AboutPage },
      { path: "websites", Component: HomePage },
      { path: "changelog", Component: ChangelogPage },
    ],
  },
]);
