import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/public/HomePage";
import { PostPage } from "./pages/public/PostPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { PostEditorPage } from "./pages/admin/PostEditorPage";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="blog/:slug" element={<PostPage />} />

                <Route path="admin/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="admin" element={<DashboardPage />} />
                  <Route path="admin/posts/new" element={<PostEditorPage />} />
                  <Route path="admin/posts/:id" element={<PostEditorPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
