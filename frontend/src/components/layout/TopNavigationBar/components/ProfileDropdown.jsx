// import { Link } from 'react-router-dom';
// import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
// import IconifyIcon from '@/components/wrappers/IconifyIcon';
// import avatar1 from '@/assets/images/users/avatar-1.jpg';
// const ProfileDropdown = () => {
//   return <Dropdown className="topbar-item" align={'end'}>
//       <DropdownToggle as="button" type="button" className="topbar-button content-none" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//         <span className="d-flex align-items-center">
//           <img className="rounded-circle" width={32} height={32} src={avatar1} alt="avatar-3" />
//         </span>
//       </DropdownToggle>
//       <DropdownMenu>
//         <DropdownHeader as="h6">Welcome Gaston!</DropdownHeader>
//         <DropdownItem as={Link} to="/pages/profile">
//           <IconifyIcon icon="bx:user-circle" className="text-muted fs-18 align-middle me-1" />
//           <span className="align-middle">Profile</span>
//         </DropdownItem>
//         <DropdownItem as={Link} to="/apps/chat">
//           <IconifyIcon icon="bx:message-dots" className="text-muted fs-18 align-middle me-1" />
//           <span className="align-middle">Messages</span>
//         </DropdownItem>
//         <DropdownItem as={Link} to="/pages/pricing">
//           <IconifyIcon icon="bx:wallet" className="text-muted fs-18 align-middle me-1" />
//           <span className="align-middle">Pricing</span>
//         </DropdownItem>
//         <DropdownItem as={Link} to="/pages/faqs">
//           <IconifyIcon icon="bx:help-circle" className="text-muted fs-18 align-middle me-1" />
//           <span className="align-middle">Help</span>
//         </DropdownItem>
//         <DropdownItem as={Link} to="/auth/lock-screen">
//           <IconifyIcon icon="bx:lock" className="text-muted fs-18 align-middle me-1" />
//           <span className="align-middle">Lock screen</span>
//         </DropdownItem>
//         <DropdownDivider className="dropdown-divider my-1" />
//         <DropdownItem as={Link} className="text-danger" to="/auth/sign-in">
//           <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
//           <span className="align-middle">Logout</span>
//         </DropdownItem>
//       </DropdownMenu>
//     </Dropdown>;
// };
// export default ProfileDropdown;

import { Link } from 'react-router-dom';
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAuth } from '@/context/AuthContext'; // Import your auth context
import avatar1 from '@/assets/images/users/avatar-1.jpg';

const ProfileDropdown = () => {
  // Get the current user from your auth context
  const { user, isAuthenticated, isLoading, clearAuth } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    clearAuth();
    // You might want to redirect to login page after logout
    // navigate('/auth/sign-in');
  };

  // Fallback values if user data is not available
  const userName = user?.name || user?.username || user?.email || 'User';
  const userAvatar = user?.image || user?.avatar || avatar1;

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    return (
      <div className="topbar-item">
        <span className="d-flex align-items-center">
          <div className="rounded-circle bg-light" style={{ width: 32, height: 32 }} />
        </span>
      </div>
    );
  }

  // Don't show dropdown if not authenticated
  if (!isAuthenticated) {
    return (
      <Link to="/auth/sign-in" className="btn btn-primary">
        Sign In
      </Link>
    );
  }

  return (
    <Dropdown className="topbar-item" align={'end'}>
      <DropdownToggle 
        as="button" 
        type="button" 
        className="topbar-button content-none" 
        id="page-header-user-dropdown" 
        data-bs-toggle="dropdown" 
        aria-haspopup="true" 
        aria-expanded="false"
      >
        <span className="d-flex align-items-center">
          <img 
            className="rounded-circle" 
            width={32} 
            height={32} 
            src={userAvatar} 
            alt={userName}
          />
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownHeader as="h6">Welcome {userName}!</DropdownHeader>
        <DropdownItem as={Link} to="/pages/profile">
          <IconifyIcon icon="bx:user-circle" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Profile</span>
        </DropdownItem>
        <DropdownItem as={Link} to="/apps/chat">
          <IconifyIcon icon="bx:message-dots" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Messages</span>
        </DropdownItem>
        <DropdownItem as={Link} to="/pages/pricing">
          <IconifyIcon icon="bx:wallet" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Pricing</span>
        </DropdownItem>
        <DropdownItem as={Link} to="/pages/faqs">
          <IconifyIcon icon="bx:help-circle" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Help</span>
        </DropdownItem>
        <DropdownItem as={Link} to="/auth/lock-screen">
          <IconifyIcon icon="bx:lock" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Lock screen</span>
        </DropdownItem>
        <DropdownDivider className="dropdown-divider my-1" />
        <DropdownItem 
          as={Link} 
          className="text-danger" 
          to="/auth/sign-in"
          onClick={handleLogout}
        >
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;