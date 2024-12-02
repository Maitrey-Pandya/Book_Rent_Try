import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { SignUpOptions } from '../components/auth/SignUpOptions';
import { SignupForm } from '../components/auth/SignUpForm';

export function SignUp() {
  const [selectedRole, setSelectedRole] = useState(null);

  if (!selectedRole) {
    return <SignUpOptions onSelectRole={setSelectedRole} />;
  }

  return <SignupForm initialRole={selectedRole} />;
}