import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostWritePage from "./pages/PostWritePage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminPostPage from "./pages/admin/AdminPostPage";
import AdminCommentPage from "./pages/admin/AdminCommentPage";
import AdminReviewPage from "./pages/admin/AdminReviewPage";

import { Toaster } from "sonner";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />
        <Route path="/posts" element={<PostListPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route 
          path="posts/write"
          element={
            <PrivateRoute>
              <PostWritePage />
            </PrivateRoute>
          }
        />
        <Route 
          path="/posts/:postId/edit"
          element={
            <PrivateRoute>
              <PostWritePage />
            </PrivateRoute>
          }
        />

        <Route 
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="posts" element={<AdminPostPage />} />
          <Route path="comments" element={<AdminCommentPage />} />
          <Route path="reviews" element={<AdminReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;