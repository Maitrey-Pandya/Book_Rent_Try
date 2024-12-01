import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { Books } from './pages/Books';
import { BookDetails } from './pages/BookDetails';
import { RentBook } from './pages/RentBook';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { TransactionHistory } from './pages/TransactionHistory';
import { Settings } from './pages/Setting';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Public Route Component (accessible only when not logged in)
function PublicRoute({ children }) {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/:id"
        element={
          <ProtectedRoute>
            <BookDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rent-book"
        element={
          <ProtectedRoute>
            <RentBook />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      // In your routes configuration
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}