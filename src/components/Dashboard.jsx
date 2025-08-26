import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiBell, FiSettings, FiCamera, FiAlertCircle, FiActivity, 
  FiPower, FiShield, FiChevronUp, FiPlus, FiUsers,
  FiHardDrive, FiBarChart2, FiCalendar, FiMap, FiVideo,
  FiClock, FiRefreshCw, FiAward, FiDatabase
} from 'react-icons/fi';
import { 
  IoAnalytics, IoVideocam, IoSpeedometer, IoNotifications,
  IoShieldCheckmark, IoTime, IoStatsChart
} from 'react-icons/io5';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setDevice } from '../store/deviceSlice';

// Light theme color scheme
const colors = {
  primary: '#4f46e5',
  primaryLight: '#6366f1',
  primaryDark: '#4338ca',
  bgLight: '#f9fafb',
  bgLighter: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.05)',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  border: '#e5e7eb'
};

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Light theme glass morphism effect
const glassMorphism = `
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

// Styled Components with light theme adjustments
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.bgLight};
  font-family: 'Inter', sans-serif;
  color: ${colors.textPrimary};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  
  span {
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight});
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 0.5px;
  }
  
  svg {
    color: ${colors.primary};
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const UserControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.1);
  border: none;
  color: ${colors.textPrimary};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: ${colors.primary};
    color: white;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }

  &.spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const NotificationBadge = styled(IconButton)`
  &::after {
    content: '3';
    position: absolute;
    top: -5px;
    right: -5px;
    width: 18px;
    height: 18px;
    background: ${colors.danger};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: bold;
    animation: ${pulse} 2s infinite;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(107, 114, 128, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary};
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    
    span {
      color: white;
    }
  }
  
  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(79, 70, 229, 0.2);
  }
  
  span {
    font-weight: 500;
    font-size: 0.9rem;
    color: ${colors.textPrimary};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: ${colors.bgLight};
`;

const MainContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background: ${colors.bgLighter};
  border-radius: 16px;
  animation: fadeIn 0.6s ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.border};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StatusCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatusCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid ${colors.border};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.color || colors.primary};
    transition: all 0.4s ease;
  }
  
  &:hover::before {
    width: 8px;
    background: linear-gradient(to bottom, ${colors.primary}, ${colors.primaryLight});
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  svg {
    color: ${props => props.color || colors.primary};
    background: rgba(79, 70, 229, 0.1);
    padding: 0.5rem;
    border-radius: 12px;
    width: 40px;
    height: 40px;
    transition: all 0.3s ease;
  }
`;

const CardValue = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.div`
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  margin-bottom: 0.75rem;
`;

const CardTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  color: ${props => props.positive ? colors.success : colors.danger};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const CardProgress = styled.div`
  height: 6px;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 3px;
  margin-top: 1.5rem;
  overflow: hidden;
  
  div {
    height: 100%;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight});
    width: ${props => props.percent}%;
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0.2)
      );
      animation: ${gradientFlow} 2s linear infinite;
      background-size: 200% auto;
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1.5rem;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  
  svg {
    color: ${colors.primary};
  }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg, 
      rgba(0, 0, 0, 0.05), 
      rgba(0, 0, 0, 0.1), 
      rgba(0, 0, 0, 0.05)
    );
    margin-left: 1.5rem;
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
    background: linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChartContainer = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 2rem;
  height: ${props => props.height || '400px'};
  transition: all 0.4s ease;
  border: 1px solid ${colors.border};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivity = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  padding: 1.75rem;
  height: 100%;
  border: 1px solid ${colors.border};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  flex-shrink: 0;
  
  svg {
    color: ${colors.primary};
    font-size: 1.25rem;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${colors.textPrimary};
  }
  
  p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: ${colors.textSecondary};
  }
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    font-size: 0.9rem;
  }
`;

const CameraStatusItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(107, 114, 128, 0.05);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => 
    props.status === 'Online' ? colors.success : 
    props.status === 'Warning' ? colors.warning : colors.danger};
  
  &:hover {
    background: rgba(107, 114, 128, 0.1);
    transform: translateX(5px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => 
    props.status === 'Online' ? colors.success : 
    props.status === 'Warning' ? colors.warning : colors.danger};
  margin-right: 1rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    border: 1px solid ${props => 
      props.status === 'Online' ? colors.success : 
      props.status === 'Warning' ? colors.warning : colors.danger};
    opacity: 0.4;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${colors.textSecondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${colors.danger};
`;

export default function Dashboard() {
  const [systemData, setSystemData] = useState(null);
  const [notificationData, setNotificationData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [errorHealth, setErrorHealth] = useState(null);
  const [errorNotifications, setErrorNotifications] = useState(null);

  const deviceId = localStorage.getItem("device") || sessionStorage.getItem("device");
  const deviceIP = localStorage.getItem("DeviceIp") || sessionStorage.getItem("DeviceIp");

  useEffect(() => {
    if (deviceIP && deviceId) {
      fetchHealthData();
    } else {
      console.warn("Device IP or ID is missing from storage.");
      setLoadingHealth(false);
    }
  }, []);
  const fetchHealthData = async () => {
    console.log(`http://${deviceIP}:5002/health`);
    console.log(`Device ID: ${deviceId}`);
    try {
      const res = await axios.get(`http://${deviceIP}:5002/health`);
      
      
      setSystemData(res.data);
      setErrorHealth(null);
    } catch (err) {
      setErrorHealth(err.message);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchNotificationData = async () => {
    try {
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      const startDateStr = startDate.toISOString().split('T')[0];

      const res = await axios.get(
        `http://100.66.89.46:3000/api/notifications/summary?startDate=${startDateStr}&endDate=${endDate}&device_id=${deviceId}`
      );
      setNotificationData(res.data.data);
      setErrorNotifications(null);
    } catch (err) {
      setErrorNotifications(err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    // Fetch both data sources independently
    fetchHealthData();
    fetchNotificationData();
  }, []);

  const refreshData = async () => {
    setLoadingHealth(true);
    setLoadingNotifications(true);
    setErrorHealth(null);
    setErrorNotifications(null);
    await Promise.all([fetchHealthData(), fetchNotificationData()]);
  };

  const lineChartData = useMemo(() => {
    if (!notificationData) return null;
    const dateMap = {};
    notificationData.forEach(item => {
      const dateObj = new Date(item.event_date);
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[date]) dateMap[date] = { name: date, Fire: 0,  Motion: 0, fullDate: dateObj };
      dateMap[date][item.type] = parseInt(item.total_notifications);
    });
    return Object.values(dateMap).sort((a, b) => a.fullDate - b.fullDate);
  }, [notificationData]);

  const pieChartData = useMemo(() => {
    if (!notificationData) return null;
    const typeMap = { Fire: 0,  Motion: 0 };
    notificationData.forEach(item => {
      typeMap[item.type] += parseInt(item.total_notifications);
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [notificationData]);

  const barChartData = useMemo(() => 
    pieChartData ? pieChartData.map(d => ({ name: d.name, count: d.value })) : null, 
    [pieChartData]
  );

  const totalNotifications = useMemo(() => 
    notificationData ? notificationData.reduce((sum, item) => sum + parseInt(item.total_notifications), 0) : null, 
    [notificationData]
  );

  const cameraStatusData = useMemo(() => [
    { 
      name: 'Camera 1', 
      status: systemData?.cameras?.active >= 1 ? 'Online' : 'Offline', 
      alerts: 0, 
      uptime: 'N/A' 
    },
    { 
      name: 'Camera 2', 
      status: systemData?.cameras?.active >= 2 ? 'Online' : 'Offline', 
      alerts: 0, 
      uptime: 'N/A' 
    }
  ], [systemData]);

  const radialChartData = useMemo(() => [
    { name: 'System Health', value: 100, fill: colors.primary },
    { name: 'Storage', value: systemData?.system?.disk?.percent_used ?? 0, fill: colors.info },
    { name: 'Memory', value: systemData?.system?.memory_percent ?? 0, fill: colors.success },
  ], [systemData]);

  const COLORS = [colors.danger, colors.warning, colors.primary];

  // Helper components for loading states
  const LoadingCard = () => (
    <StatusCard>
      <CardHeader>
        <h3>Loading...</h3>
        <FiRefreshCw className="spin" size={20} />
      </CardHeader>
      <CardValue>--</CardValue>
      <CardDescription>Fetching data...</CardDescription>
      <CardProgress percent={30}>
        <div />
      </CardProgress>
    </StatusCard>
  );

  const ErrorCard = ({ message }) => (
    <StatusCard>
      <CardHeader color={colors.danger}>
        <h3>Error</h3>
        <FiAlertCircle size={20} />
      </CardHeader>
      <CardValue>!</CardValue>
      <CardDescription>{message}</CardDescription>
    </StatusCard>
  );

  const LoadingChart = ({ height = '400px' }) => (
    <ChartContainer height={height}>
      <LoadingContainer>Loading chart data...</LoadingContainer>
    </ChartContainer>
  );

  const ErrorChart = ({ message, height = '400px' }) => (
    <ChartContainer height={height}>
      <ErrorContainer>{message}</ErrorContainer>
    </ChartContainer>
  );

  return (
    <DashboardContainer>
      <MainContent>
        <ContentArea>
          <MainContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionTitle>
                <IoAnalytics size={28} /> Security Dashboard
              </SectionTitle>
              <PrimaryButton onClick={refreshData}>
                <FiRefreshCw size={18} /> Refresh Data
              </PrimaryButton>
            </div>

            <StatusCards>
              {/* Active Cameras Card */}
              {loadingHealth ? (
                <LoadingCard />
              ) : errorHealth ? (
                <ErrorCard message={errorHealth} />
              ) : (
                <StatusCard color={colors.primary}>
                  <CardHeader color={colors.primary}>
                    <h3>Active Cameras</h3>
                    <FiCamera size={20} />
                  </CardHeader>
                  <CardValue>{systemData.cameras.active}/{systemData.cameras.total}</CardValue>
                  <CardDescription>{systemData.cameras.percentage.toFixed(1)}% cameras operational</CardDescription>
                  <CardTrend positive={systemData.cameras.percentage > 50}>
                    {systemData.cameras.percentage > 50 ? 'Good' : 'Needs attention'}
                  </CardTrend>
                  <CardProgress percent={systemData.cameras.percentage}>
                    <div />
                  </CardProgress>
                </StatusCard>
              )}

              {/* Storage Used Card */}
              {loadingHealth ? (
                <LoadingCard />
              ) : errorHealth ? (
                <ErrorCard message={errorHealth} />
              ) : (
                <StatusCard color={colors.danger}>
                  <CardHeader color={colors.danger}>
                    <h3>Storage Used</h3>
                    <FiHardDrive size={20} />
                  </CardHeader>
                  <CardValue>{systemData.system.disk.percent_used.toFixed(1)}%</CardValue>
                  <CardDescription>
                    {systemData.system.disk.used_gb.toFixed(1)}GB of {systemData.system.disk.total_gb.toFixed(1)}GB used
                  </CardDescription>
                  <CardTrend positive={systemData.system.disk.percent_used < 80}>
                    {systemData.system.disk.percent_used < 80 ? 'Enough space' : 'Consider cleanup'}
                  </CardTrend>
                  <CardProgress percent={systemData.system.disk.percent_used}>
                    <div />
                  </CardProgress>
                </StatusCard>
              )}

              {/* Memory Usage Card */}
              {loadingHealth ? (
                <LoadingCard />
              ) : errorHealth ? (
                <ErrorCard message={errorHealth} />
              ) : (
                <StatusCard color={colors.warning}>
                  <CardHeader color={colors.warning}>
                    <h3>Memory Usage</h3>
                    <FiActivity size={20} />
                  </CardHeader>
                  <CardValue>{systemData.system.memory_percent.toFixed(1)}%</CardValue>
                  <CardDescription>System memory utilization</CardDescription>
                  <CardTrend positive={systemData.system.memory_percent < 70}>
                    {systemData.system.memory_percent < 70 ? 'Normal' : 'High usage'}
                  </CardTrend>
                  <CardProgress percent={systemData.system.memory_percent}>
                    <div />
                  </CardProgress>
                </StatusCard>
              )}

              {/* System Uptime Card */}
              {loadingHealth ? (
                <LoadingCard />
              ) : errorHealth ? (
                <ErrorCard message={errorHealth} />
              ) : (
                <StatusCard color={colors.success}>
                  <CardHeader color={colors.success}>
                    <h3>System Uptime</h3>
                    <FiPower size={20} />
                  </CardHeader>
                  <CardValue>{systemData.system.uptime}</CardValue>
                  <CardDescription>Current system uptime</CardDescription>
                  <CardTrend positive>
                    No issues detected
                  </CardTrend>
                  <CardProgress percent={100}>
                    <div />
                  </CardProgress>
                </StatusCard>
              )}

              {/* Total Notifications Card */}
              {loadingNotifications ? (
                <LoadingCard />
              ) : errorNotifications ? (
                <ErrorCard message={errorNotifications} />
              ) : (
                <StatusCard color={colors.info}>
                  <CardHeader color={colors.info}>
                    <h3>Total Notifications</h3>
                    <FiBell size={20} />
                  </CardHeader>
                  <CardValue>{totalNotifications}</CardValue>
                  <CardDescription>In the last week</CardDescription>
                  <CardTrend positive={totalNotifications < 100}>
                    {totalNotifications < 100 ? 'Normal' : 'High activity'}
                  </CardTrend>
                  <CardProgress percent={(totalNotifications / 200) * 100}>
                    <div />
                  </CardProgress>
                </StatusCard>
              )}
            </StatusCards>

            <SectionTitle>
              <IoStatsChart size={24} /> System Analytics
            </SectionTitle>
            
            <GridLayout>
              {/* Area Chart */}
              {loadingNotifications ? (
                <LoadingChart />
              ) : errorNotifications ? (
                <ErrorChart message={errorNotifications} />
              ) : (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineChartData}>
                      <defs>
                        <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.danger} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors.danger} stopOpacity={0}/>
                        </linearGradient>
                      
                        <linearGradient id="colorMotion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="name" stroke={colors.textSecondary} />
                      <YAxis stroke={colors.textSecondary} />
                      <Tooltip 
                        contentStyle={{
                          background: colors.cardBg,
                          borderColor: colors.border,
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="Fire" 
                        stroke={colors.danger} 
                        fillOpacity={1} 
                        fill="url(#colorFire)" 
                        strokeWidth={2}
                      />
                    
                      <Area 
                        type="monotone" 
                        dataKey="Motion" 
                        stroke={colors.primary} 
                        fillOpacity={1} 
                        fill="url(#colorMotion)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {/* Radial Chart */}
              {loadingHealth ? (
                <LoadingChart />
              ) : errorHealth ? (
                <ErrorChart message={errorHealth} />
              ) : (
                <ChartContainer height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="20%" 
                      outerRadius="90%" 
                      data={radialChartData}
                      startAngle={180}
                      endAngle={-180}
                    >
                      <PolarAngleAxis 
                        type="number" 
                        domain={[0, 100]} 
                        angleAxisId={0} 
                        tick={false}
                      />
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        animationBegin={100}
                      >
                        {radialChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </RadialBar>
                      <Legend 
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                      />
                      <Tooltip 
                        contentStyle={{
                          background: colors.cardBg,
                          borderColor: colors.border,
                          borderRadius: '12px'
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </GridLayout>

            <GridLayout>
              {/* Bar Chart */}
              {loadingNotifications ? (
                <LoadingChart />
              ) : errorNotifications ? (
                <ErrorChart message={errorNotifications} />
              ) : (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="name" stroke={colors.textSecondary} />
                      <YAxis stroke={colors.textSecondary} />
                      <Tooltip 
                        contentStyle={{
                          background: colors.cardBg,
                          borderColor: colors.border,
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill={colors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {/* Pie Chart */}
              {loadingNotifications ? (
                <LoadingChart height="400px" />
              ) : errorNotifications ? (
                <ErrorChart message={errorNotifications} height="400px" />
              ) : (
                <ChartContainer height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          background: colors.cardBg,
                          borderColor: colors.border,
                          borderRadius: '12px',
                          boxshadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </GridLayout>

            <SectionTitle>
              <IoVideocam size={24} /> Camera Management
            </SectionTitle>

            <GridLayout cols="2fr 1fr">
              {/* Camera Status */}
              {loadingHealth ? (
                <LoadingChart height="auto" />
              ) : errorHealth ? (
                <ErrorChart message={errorHealth} height="auto" />
              ) : (
                <ChartContainer height="auto">
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: colors.textPrimary }}>
                    Camera Status Overview
                  </h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {cameraStatusData.map((camera, index) => (
                      <CameraStatusItem key={index} status={camera.status}>
                        <StatusIndicator status={camera.status} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: colors.textPrimary }}>{camera.name}</div>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: colors.textSecondary,
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '0.25rem'
                          }}>
                            <span>Alerts: {camera.alerts}</span>
                            <span>Status: {camera.status}</span>
                          </div>
                        </div>
                        <IconButton style={{ width: '36px', height: '36px' }}>
                          <FiSettings size={16} />
                        </IconButton>
                      </CameraStatusItem>
                    ))}
                  </div>
                </ChartContainer>
              )}

              {/* System Information */}
              {loadingHealth ? (
                <LoadingChart height="auto" />
              ) : errorHealth ? (
                <ErrorChart message={errorHealth} height="auto" />
              ) : (
                <RecentActivity>
                  <h3 style={{ 
                    marginTop: 0, 
                    marginBottom: '1.5rem', 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: colors.textPrimary
                  }}>
                    <FiClock /> System Information
                  </h3>
                  <ActivityItem>
                    <ActivityIcon><IoSpeedometer /></ActivityIcon>
                    <ActivityContent>
                      <h4>CPU Usage</h4>
                      <p>{systemData.system.cpu_percent}% utilization</p>
                    </ActivityContent>
                    <ActivityTime>Live</ActivityTime>
                  </ActivityItem>
                  <ActivityItem>
                    <ActivityIcon><FiHardDrive /></ActivityIcon>
                    <ActivityContent>
                      <h4>Disk Status</h4>
                      <p>{systemData.system.disk.free_gb.toFixed(1)}GB free space available</p>
                    </ActivityContent>
                    <ActivityTime>Live</ActivityTime>
                  </ActivityItem>
                  <ActivityItem>
                    <ActivityIcon><FiPower /></ActivityIcon>
                    <ActivityContent>
                      <h4>System Temperature</h4>
                      <p>{systemData.system.temperature}°C</p>
                    </ActivityContent>
                    <ActivityTime>Live</ActivityTime>
                  </ActivityItem>
                  <ActivityItem>
                    <ActivityIcon><FiVideo /></ActivityIcon>
                    <ActivityContent>
                      <h4>Network Status</h4>
                      <p>IP: {systemData.system.ip}</p>
                    </ActivityContent>
                    <ActivityTime>Live</ActivityTime>
                  </ActivityItem>
                </RecentActivity>
              )}
            </GridLayout>
          </MainContainer>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
}