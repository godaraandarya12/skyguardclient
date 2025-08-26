import { useState, useEffect } from 'react';
import { 
  FiUsers, FiUser, FiMail, FiPhone, 
  FiMapPin, FiShield, FiEdit2, FiTrash2, 
  FiPlus, FiSearch, FiFilter, FiChevronDown,
  FiClock, FiActivity, FiAward, FiKey
} from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

// Styled Components with responsive adjustments
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #1e293b;
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    h1 {
      font-size: 1.5rem;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
`;

const PrimaryButton = styled(motion.button)`
  background: #6366f1;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);

  &:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(99, 102, 241, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  width: 300px;

  input {
    border: none;
    outline: none;
    padding: 0.5rem;
    width: 100%;
    font-size: 0.95rem;
    color: #1e293b;

    &::placeholder {
      color: #94a3b8;
    }
  }

  svg {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    width: 100%;
    input {
      font-size: 0.85rem;
    }
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out 0.1s both;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StatValue = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color + '20'};
  color: ${props => props.color};

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const UsersTableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  animation: ${fadeIn} 0.5s ease-out 0.2s both;

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const TableTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const TableControls = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensures table is wide enough to need scrolling on mobile */
`;

const TableHead = styled.thead`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const TableHeaderCell = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:first-child {
    border-top-left-radius: 12px;
  }

  &:last-child {
    border-top-right-radius: 12px;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
  }
`;

const TableRow = styled(motion.tr)`
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  color: #1e293b;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#6366f1'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const UserEmail = styled.span`
  font-size: 0.85rem;
  color: #64748b;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.role === 'Admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(203, 213, 225, 0.1)'};
  color: ${props => props.role === 'Admin' ? '#6366f1' : '#64748b'};

  @media (max-width: 768px) {
    padding: 0.2rem 0.6rem;
    font-size: 0.65rem;
  }
`;

const RtpBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.3rem;
  }
`;

const RtpAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color || '#94a3b8'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.5rem;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: ${props => props.color || '#6366f1'};
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: rgba(248, 113, 113, 0.05);
  border-radius: 12px;
  border: 1px dashed #f87171;
  color: #dc2626;
  padding: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    height: 200px;
    padding: 1rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  padding: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    height: 200px;
    padding: 1rem;
  }
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #6366f1;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://100.66.89.46:3000/api/auth/allusers");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Map API data to expected format, renaming created_at to createdAt
          const mappedUsers = result.data.map(user => ({
            ...user,
            createdAt: user.created_at,
          }));
          setUsers(mappedUsers);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Updated search to include rtps.name
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rtps.some(rtp => rtp.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditUser = (userId) => {
    console.log('Edit user:', userId);
     navigate(`/devices?userId=${userId}`);
    
  };

 
  const handleAddUser = () => {
    navigate('/users');
  };

  const getUserInitials = (name) => {
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate stats for the dashboard
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'Admin').length;
  const totalDevices = users.reduce((acc, user) => acc + user.devices.length, 0);
  const totalRtps = users.reduce((acc, user) => acc + user.rtps.length, 0);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <PrimaryButton onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Retry
        </PrimaryButton>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1><FiUsers /> User Management</h1>
        <HeaderActions>
          <SearchBar>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <PrimaryButton 
            onClick={handleAddUser}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus /> Add User
          </PrimaryButton>
        </HeaderActions>
      </DashboardHeader>

      {/* StatsContainer for user metrics */}
      <StatsContainer>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatIcon color="#6366f1">
            <FiUsers />
          </StatIcon>
          <StatValue>{totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatIcon color="#10b981">
            <FiShield />
          </StatIcon>
          <StatValue>{adminUsers}</StatValue>
          <StatLabel>Admin Users</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatIcon color="#3b82f6">
            <FiActivity />
          </StatIcon>
          <StatValue>{totalDevices}</StatValue>
          <StatLabel>Connected Devices</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatIcon color="#f59e0b">
            <FiAward />
          </StatIcon>
          <StatValue>{totalRtps}</StatValue>
          <StatLabel>RTPs</StatLabel>
        </StatCard>
      </StatsContainer>

      <UsersTableContainer>
        <TableHeader>
          <TableTitle>All Users ({filteredUsers.length})</TableTitle>
          <TableControls>
            <PrimaryButton 
              onClick={handleAddUser}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus /> Add
            </PrimaryButton>
          </TableControls>
        </TableHeader>

        {filteredUsers.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <FiUser size={24} />
            </EmptyStateIcon>
            <h3>No users found</h3>
            <p>Try adjusting your search</p>
            <PrimaryButton 
              onClick={() => setSearchTerm('')}
              style={{ marginTop: '1rem' }}
            >
              Clear search
            </PrimaryButton>
          </EmptyState>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>RTPs</TableHeaderCell>
                <TableHeaderCell>Devices</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
                >
                  <TableCell>
                    <UserAvatar>
                      <Avatar color="#6366f1">
                        {getUserInitials(user.name)}
                      </Avatar>
                      <UserInfo>
                        <UserName>{user.name}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                      </UserInfo>
                    </UserAvatar>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role}>
                      {user.role}
                    </RoleBadge>
                  </TableCell>
                  <TableCell>
                    <RtpBadge>
                      {user.rtps.map((rtp, index) => (
                        <RtpAvatar 
                          key={index} 
                          color="#94a3b8"
                          title={rtp.name}
                        >
                          {rtp.name[0].toUpperCase()}
                        </RtpAvatar>
                      ))}
                    </RtpBadge>
                  </TableCell>
                  <TableCell>
                    {user.devices.length > 0 ? (
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>
                        {user.devices.length}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionButton 
                        onClick={() => handleEditUser(user.devices[0])}
                        color="#3b82f6"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </ActionButton>
                    
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </UsersTableContainer>
    </DashboardContainer>
  );
}