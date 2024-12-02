import { Container } from '@mui/material';
import { UserProfile } from '../components/profile/UserProfile';

export function Profile() {
  console.log('Profile page rendering');
  
  return (
    <Container maxWidth="md">
      <UserProfile />
    </Container>
  );
}