import Layout from "./Layout/Layout";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Project from "./pages/Project";
import ProjectInfo from "./components/ProjectInfo";
import Error from "./pages/Error";
import { nameRevealedProvider as NameRevealedProvider } from "./hoc/useContext";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      { path: "", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      {
        path: "projects",
        element: <Project />,
      },
      {
        path: "projects/:projectName",
        element: <ProjectInfo />,
      },
    ],
  },
]);

function App() {
  return (
    <NameRevealedProvider>
      <RouterProvider router={router} />;
    </NameRevealedProvider>
  );
}

export default App;
