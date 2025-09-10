import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BuiltForComfort from "./pages/BuiltForComfort";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminProductsNew from "./pages/AdminProductsNew";
import AdminReports from "./pages/AdminReports";
import AdminCustomers from "./pages/AdminCustomers";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminCategoriesNew from "./pages/AdminCategoriesNew";
import AdminProductsEnhanced from "./pages/AdminProductsEnhanced";
import AdminProductsTest from "./pages/AdminProductsTest";
import AdminProductsEnhancedSimple from "./pages/AdminProductsEnhancedSimple";
import AdminProductsSimple from "./pages/AdminProductsSimple";
import AdminCategoriesEnhanced from "./pages/AdminCategoriesEnhanced";
import AdminCategoriesSimple from "./pages/AdminCategoriesSimple";
import TestEnhanced from "./pages/TestEnhanced";
import AdminConnectionTest from "./pages/AdminConnectionTest";
import CategoryProducts from "./pages/CategoryProducts";
import AdminEmailSettings from "./pages/AdminEmailSettings";
import SetupEmailTables from "./pages/SetupEmailTables";
import TestEmail from "./pages/TestEmail";
import SetupDatabase from "./pages/SetupDatabase";
import SetupStorage from "./pages/SetupStorage";
import UpdateProductSchema from "./pages/UpdateProductSchema";
import SeedData from "./pages/SeedData";
import NotFound from "./pages/NotFound";
import ThankYou from "./pages/ThankYou";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/built-for-comfort" element={<BuiltForComfort />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProductsEnhanced /></ProtectedRoute>} />
          <Route path="/admin/products-new" element={<ProtectedRoute><AdminProductsNew /></ProtectedRoute>} />
          <Route path="/admin/products/:category" element={<ProtectedRoute><CategoryProducts /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
          <Route path="/admin/categories-new" element={<ProtectedRoute><AdminCategoriesSimple /></ProtectedRoute>} />
          <Route path="/admin/products-enhanced" element={<ProtectedRoute><AdminProductsEnhanced /></ProtectedRoute>} />
          <Route path="/admin/products-test" element={<ProtectedRoute><AdminProductsTest /></ProtectedRoute>} />
          <Route path="/admin/categories-enhanced" element={<ProtectedRoute><AdminCategoriesEnhanced /></ProtectedRoute>} />
          <Route path="/admin/connection-test" element={<ProtectedRoute><AdminConnectionTest /></ProtectedRoute>} />
          <Route path="/admin/email-settings" element={<ProtectedRoute><AdminEmailSettings /></ProtectedRoute>} />
          <Route path="/setup-email-tables" element={<SetupEmailTables />} />
          <Route path="/test-email" element={<TestEmail />} />
          <Route path="/setup-database" element={<SetupDatabase />} />
          <Route path="/setup-storage" element={<SetupStorage />} />
          <Route path="/update-schema" element={<UpdateProductSchema />} />
          <Route path="/seed-data" element={<SeedData />} />
          <Route path="/thank-you" element={<ThankYou />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
