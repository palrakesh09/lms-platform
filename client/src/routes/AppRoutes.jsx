import { Route, Routes } from "react-router";
import LearningLayout from "../layouts/LearningLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import AccountPage from "../pages/AccountPage.jsx";
import CourseDetailPage from "../pages/courses/CourseDetailPage.jsx";
import CoursesPage from "../pages/courses/CoursesPage.jsx";
import AdminDashboardPage from "../components/dashboard/AdminDashboardPage.jsx";
import CourseFormPage from "../components/dashboard/CourseFormPage.jsx";
import ManageCoursePage from "../pages/dashboard/ManageCoursePage.jsx";
import ManageCoursesPage from "../components/dashboard/ManageCoursesPage.jsx";
import MentorDashboardPage from "../components/dashboard/MentorDashboardPage.jsx";
import UsersPage from "../components/dashboard/UsersPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import LearningIndexPage from "../pages/learning/LearningIndexPage.jsx";
import ResourcePage from "../pages/learning/ResourcePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import MyLearningPage from "../pages/courses/MyLearningPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import RoleAreaPage from "../pages/RoleAreaPage.jsx";
import { ROLES } from "../utils/roles.js";
import DashboardGate from "./DashboardGate.jsx";
import GuestRoute from "./GuestRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import QuestionsPage from "../pages/dashboard/QuestionsPage.jsx";
import QuizAttemptPage from "../pages/quiz/QuizAttemptPage.jsx";
import QuizAttemptsPage from "../pages/quiz/QuizAttemptsPage.jsx";
import QuizDetailPage from "../pages/quiz/QuizDetailPage.jsx";
import QuizResultPage from "../pages/quiz/QuizResultPage.jsx";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage.jsx";
import MentorAnalyticsPage from "../pages/mentor/MentorAnalyticsPage.jsx";
import MentorCourseAnalyticsPage from "../pages/mentor/MentorCourseAnalyticsPage.jsx";
import StudentPerformancePage from "../pages/student/StudentPerformancePage.jsx";
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import ActivityPage from '../pages/ActivityPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import AnnouncementsPage from '../pages/dashboard/AnnouncementsPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
        </Route>
        <Route
          path="quizzes/:quizId/questions"
          element={<QuestionsPage area="admin" />}
        />
        <Route
          path="quizzes/:quizId/questions"
          element={<QuestionsPage area="mentor" />}
        />
        // as a new top-level, student-facing, authenticated block (alongside
        the existing learn/:courseId block):
        <Route element={<ProtectedRoute />}>
          <Route path="quiz/:quizId" element={<QuizDetailPage />} />
          <Route path="quiz/:quizId/attempts" element={<QuizAttemptsPage />} />
          <Route
            path="quiz/:quizId/attempt/:attemptId"
            element={<QuizAttemptPage />}
          />
          <Route
            path="quiz/:quizId/result/:attemptId"
            element={<QuizResultPage />}
          />
        </Route>
        <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
          <Route path="my-learning" element={<MyLearningPage />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
          <Route path="my-learning" element={<MyLearningPage />} />
          <Route
            path="student/performance"
            element={<StudentPerformancePage />}
          />
        </Route>
        <Route
          path="student/*"
          element={
            <ProtectedRoute roles={[ROLES.STUDENT]}>
              <RoleAreaPage title="Student area" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="admin"
        element={<DashboardGate area="admin" roles={[ROLES.ADMIN]} />}
      >
        <Route path="announcements" element={<AnnouncementsPage area="admin" />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        <Route index element={<AdminDashboardPage />} />
        <Route path="courses" element={<ManageCoursesPage area="admin" />} />
        <Route
          path="courses/new"
          element={<CourseFormPage area="admin" mode="create" />}
        />
        <Route
          path="courses/:courseId"
          element={<ManageCoursePage area="admin" />}
        />
        <Route
          path="courses/:courseId/edit"
          element={<CourseFormPage area="admin" mode="edit" />}
        />
        <Route path="users" element={<UsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="mentor"
        element={<DashboardGate area="mentor" roles={[ROLES.MENTOR]} />}
      >
        <Route path="announcements" element={<AnnouncementsPage area="mentor" />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<MentorAnalyticsPage />} />
        <Route
          path="analytics/courses/:courseId"
          element={<MentorCourseAnalyticsPage />}
        />
        <Route index element={<MentorDashboardPage />} />
        <Route path="courses" element={<ManageCoursesPage area="mentor" />} />
        <Route
          path="courses/:courseId"
          element={<ManageCoursePage area="mentor" />}
        />
        <Route
          path="courses/:courseId/edit"
          element={<CourseFormPage area="mentor" mode="edit" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="learn/:courseId" element={<LearningLayout />}>
          <Route index element={<LearningIndexPage />} />
          <Route path="resource/:resourceId" element={<ResourcePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
