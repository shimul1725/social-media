import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import Feed from "./pages/Feed";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import ChatWindow from "./pages/ChatWindow";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
            <Feed />
           </PrivateRoute>
          }
        />
        <Route
           path="/inbox"
           element={
              <PrivateRoute>
               <Inbox />
              </PrivateRoute>
           }
        />
        <Route
            path="/notifications"
            element={
               <PrivateRoute>
               <Notifications />
               </PrivateRoute>
            }
        />
        <Route
           path="/chat/:userId"
           element={
              <PrivateRoute>
              <ChatWindow />
              </PrivateRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;