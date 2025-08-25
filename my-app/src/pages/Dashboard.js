import React, { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useJobs } from "../context/JobContext";
import { FaPlus, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, FaClock, FaBriefcase } from "react-icons/fa";

// Animations
const fadeInSmooth = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

// Main Dashboard Container
const DashboardContainer = styled.div`
  background: ${({ theme }) => theme.colors?.background || 
    (theme.mode === 'dark' ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')};
  min-height: 100vh;
  padding: 24px;
  transition: background 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Inner Container
const Container = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  background: ${({ theme }) => theme.colors?.surface || (theme.mode === 'dark' ? '#1a202c' : '#ffffff')};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows?.lg || '0 10px 40px rgba(0, 0, 0, 0.15)'};
  animation: ${fadeInSmooth} 0.8s ease forwards;
  color: ${({ theme }) => theme.colors?.textPrimary || (theme.mode === 'dark' ? '#e2e8f0' : '#1a202c')};
  transition: all 0.3s ease;
  
  @media (max-width: 1024px) {
    margin: 0 20px;
    padding: 24px;
    border-radius: 16px;
  }
  @media (max-width: 600px) {
    margin: 0 16px;
    padding: 20px;
    border-radius: 12px;
  }
`;

// Dashboard Title
const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.colors?.textPrimary || (theme.mode === 'dark' ? '#e2e8f0' : '#1a202c')};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #63b3ed 0%, #9f7aea 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 24px;
  }
`;

// Stats Container
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

// Individual Stat Card
const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors?.surface || (theme.mode === 'dark' ? '#2d3748' : '#ffffff')};
  border: 1px solid ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#e2e8f0')};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 20px rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows?.lg || '0 12px 40px rgba(0, 0, 0, 0.15)'};
    border-color: ${({ theme }) => theme.colors?.primary || '#667eea'};
  }

  h3 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: ${({ status, theme }) => {
      if (theme.mode === 'dark') {
        switch (status) {
          case 'applied': return '#63b3ed';
          case 'interview': return '#f093fb';
          case 'offer': return '#4facfe';
          case 'accepted': return '#68d391';
          case 'rejected': return '#fc8181';
          default: return '#63b3ed';
        }
      } else {
        switch (status) {
          case 'applied': return '#667eea';
          case 'interview': return '#f093fb';
          case 'offer': return '#4facfe';
          case 'accepted': return '#43e97b';
          case 'rejected': return '#fa709a';
          default: return '#667eea';
        }
      }
    }};
    transition: color 0.3s ease;
  }

  p {
    font-size: 0.85rem;
    margin: 0;
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096')};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    transition: color 0.3s ease;
  }
`;

// Kanban Board Container
const KanbanBoard = styled.div`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 8px;
  min-height: 600px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors?.background || (theme.mode === 'dark' ? '#2d3748' : '#f7fafc')};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#e2e8f0')};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors?.primary || (theme.mode === 'dark' ? '#63b3ed' : '#cbd5e0')};
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

// Kanban Column
const Column = styled(motion.div)`
  flex: 1;
  min-width: 320px;
  background: ${({ theme }) => theme.colors?.surface || (theme.mode === 'dark' ? '#2d3748' : '#ffffff')};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 8px 32px rgba(0, 0, 0, 0.12)'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#f1f5f9')};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

// Column Header
const ColumnHeader = styled.div`
  background: ${({ status, theme }) => {
    if (theme.mode === 'dark') {
      switch (status) {
        case 'applied': return 'linear-gradient(135deg, #4299e1 0%, #553c9a 100%)';
        case 'interview': return 'linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%)';
        case 'offer': return 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)';
        case 'accepted': return 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        case 'rejected': return 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
        default: return 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
      }
    } else {
      switch (status) {
        case 'applied': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        case 'interview': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        case 'offer': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        case 'accepted': return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        case 'rejected': return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        default: return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      }
    }
  }};
  color: white;
  padding: 20px 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .count {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
    display: inline-block;
  }
`;

// Jobs List Container
const JobsList = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 400px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors?.background || (theme.mode === 'dark' ? '#2d3748' : '#f7fafc')};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#e2e8f0')};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors?.primary || (theme.mode === 'dark' ? '#63b3ed' : '#cbd5e0')};
    }
  }
`;

// Add Job Button
const AddJobButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  border: 2px dashed ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#e2e8f0')};
  border-radius: 12px;
  background: transparent;
  color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096')};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary || '#667eea'};
    color: ${({ theme }) => theme.colors?.primary || '#667eea'};
    background: ${({ theme }) => theme.colors?.primary || '#667eea'}20;
  }
  
  svg {
    font-size: 16px;
  }
`;

// Job Card Styled Component
const StyledJobCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors?.surface || (theme.mode === 'dark' ? '#1a202c' : '#ffffff')};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: ${({ theme }) => theme.shadows?.sm || '0 4px 20px rgba(0, 0, 0, 0.08)'};
  border: 1px solid ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#f1f5f9')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows?.lg || '0 12px 40px rgba(0, 0, 0, 0.15)'};
    border-color: ${({ theme }) => theme.colors?.primary || (theme.mode === 'dark' ? '#63b3ed' : '#e2e8f0')};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Job Card Elements
const JobTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.textPrimary || (theme.mode === 'dark' ? '#e2e8f0' : '#1a202c')};
  margin: 0 0 8px 0;
  line-height: 1.3;
  transition: color 0.3s ease;
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  
  svg {
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096')};
    font-size: 12px;
    transition: color 0.3s ease;
  }
  
  span {
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#cbd5e0' : '#4a5568')};
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s ease;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  
  svg {
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096')};
    font-size: 12px;
    transition: color 0.3s ease;
  }
  
  span {
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096')};
    font-size: 13px;
    transition: color 0.3s ease;
  }
`;

// Date Information Display
const JobDateInfo = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  
  svg {
    font-size: 12px;
    color: ${({ status, theme }) => {
      switch (status) {
        case 'overdue': return '#ef4444';
        case 'today': return '#f59e0b';
        case 'upcoming': return '#10b981';
        case 'future': return theme.colors?.primary || '#667eea';
        default: return theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096');
      }
    }};
    transition: color 0.3s ease;
  }
  
  span {
    color: ${({ status, theme }) => {
      switch (status) {
        case 'overdue': return '#dc2626';
        case 'today': return '#d97706';
        case 'upcoming': return '#059669';
        case 'future': return theme.colors?.textPrimary || (theme.mode === 'dark' ? '#e2e8f0' : '#1a202c');
        default: return theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#718096');
      }
    }};
    font-weight: ${({ status }) => ['overdue', 'today', 'upcoming'].includes(status) ? '600' : '500'};
    transition: color 0.3s ease;
  }
`;

// Job Card Footer
const JobMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || (theme.mode === 'dark' ? '#4a5568' : '#f7fafc')};
  transition: border-color 0.3s ease;
  
  .date {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#9ca3af')};
    font-size: 12px;
    transition: color 0.3s ease;
    
    svg {
      font-size: 10px;
    }
  }
`;

// Action Buttons Container
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

// Individual Action Button
const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.edit {
    background: ${({ theme }) => theme.colors?.primary || '#667eea'};
    color: white;
    
    &:hover {
      background: ${({ theme }) => theme.colors?.primaryDark || '#5a67d8'};
      transform: scale(1.05);
    }
  }
  
  &.delete {
    background: ${({ theme }) => theme.mode === 'dark' ? '#742a2a' : '#fed7d7'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#fc8181' : '#c53030'};
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? '#9c4221' : '#feb2b2'};
      transform: scale(1.05);
    }
  }
`;

// Empty State Component
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#718096' : '#a0aec0')};
  transition: color 0.3s ease;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }
`;

// Empty State for No Jobs
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: ${({ theme }) => theme.colors?.textSecondary || (theme.mode === 'dark' ? '#a0aec0' : '#9ca3af')};
  text-align: center;
  padding: 40px;
  transition: color 0.3s ease;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors?.textPrimary || (theme.mode === 'dark' ? '#e2e8f0' : '#4a5568')};
    transition: color 0.3s ease;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 24px;
  }

  button {
    background: ${({ theme }) => theme.colors?.primary || '#667eea'};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors?.primaryDark || '#5a67d8'};
      transform: translateY(-1px);
    }
  }
`;

// Job Card Component with Enhanced Date Display
const ProfessionalJobCard = ({ job, onEdit, onDelete }) => {
  // Enhanced date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.log('Date formatting error (ignored):', error);
      return null;
    }
  };

  // Check if date is upcoming/overdue
  const getDateStatus = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'overdue';
      if (diffDays === 0) return 'today';
      if (diffDays <= 7) return 'upcoming';
      return 'future';
    } catch (error) {
      return null;
    }
  };

  return (
    <StyledJobCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <JobTitle>{job.title || job.roleTitle}</JobTitle>
      
      <CompanyInfo>
        <FaBuilding />
        <span>{job.company}</span>
      </CompanyInfo>
      
      {job.location && (
        <LocationInfo>
          <FaMapMarkerAlt />
          <span>{job.location}</span>
        </LocationInfo>
      )}

      {/* Enhanced Date Display */}
      <JobDateInfo>
        {job.deadline && (
          <DateItem status={getDateStatus(job.deadline)}>
            <FaCalendarAlt />
            <span>Deadline: {formatDate(job.deadline)}</span>
          </DateItem>
        )}
        
        {job.interviewDate && (
          <DateItem status={getDateStatus(job.interviewDate)}>
            <FaClock />
            <span>Interview: {formatDate(job.interviewDate)}</span>
          </DateItem>
        )}
        
        {!job.deadline && !job.interviewDate && (
          <DateItem>
            <FaCalendarAlt />
            <span>Added: {formatDate(job.dateAdded || job.createdAt)}</span>
          </DateItem>
        )}
      </JobDateInfo>
      
      <JobMeta>
        <div className="date">
          <FaCalendarAlt />
          <span>Added {formatDate(job.dateAdded || job.createdAt) || 'Recently'}</span>
        </div>
        
        <ActionButtons>
          <ActionButton className="edit" onClick={() => onEdit(job)}>
            <FaEdit />
            Edit
          </ActionButton>
          <ActionButton className="delete" onClick={() => onDelete(job._id || job.id)}>
            <FaTrash />
            Delete
          </ActionButton>
        </ActionButtons>
      </JobMeta>
    </StyledJobCard>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  console.log('🎯 Dashboard component started rendering...');
  
  const { mode } = useTheme();
  const tabRef = useRef();
  
  // Use JobContext with proper error handling
  const jobsContext = useJobs();

  // Destructure with fallbacks
  const {
    jobs = [],
    loading = false,
    getJobStats = () => ({ total: 0, applied: 0, interview: 0, pending: 0, offer: 0, accepted: 0, rejected: 0 }),
    getJobsByStatus = () => [],
    updateJob = async () => {},
    deleteJob = async () => {},
    addJob = async () => {},
    refreshJobs = () => {}
  } = jobsContext || {};

  // Calculate stats with error handling
  let stats;
  try {
    stats = getJobStats();
  } catch (error) {
    console.log('Stats calculation failed (ignored):', error);
    stats = { total: 0, applied: 0, interview: 0, pending: 0, offer: 0, accepted: 0, rejected: 0 };
  }

  useEffect(() => {
    if (tabRef.current) {
      tabRef.current.focus();
    }
  }, [jobs.length, mode]);

  // Handle job updates
  const handleJobUpdate = async (jobId, updates) => {
    try {
      await updateJob(jobId, updates);
    } catch (error) {
      console.log('Job update failed (ignored):', error);
    }
  };

  // Handle job deletion
  const handleJobDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.log('Job deletion failed (ignored):', error);
    }
  };

  // Status configuration for Kanban columns
  const statusConfig = [
    { key: 'applied', title: 'Applied', jobs: jobs.filter(job => job.status === 'applied') },
    { key: 'interview', title: 'Interview', jobs: jobs.filter(job => job.status === 'interview') },
    { key: 'offer', title: 'Offer', jobs: jobs.filter(job => job.status === 'offer') },
    { key: 'accepted', title: 'Accepted', jobs: jobs.filter(job => job.status === 'accepted') },
    { key: 'rejected', title: 'Rejected', jobs: jobs.filter(job => job.status === 'rejected') }
  ];

  return (
    <DashboardContainer>
      <Container ref={tabRef} tabIndex={-1}>
        <Title>Your Application Tracker</Title>
        
        {/* Job Statistics */}
        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.total}</h3>
            <p>Total</p>
          </StatCard>
          <StatCard
            status="applied"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.applied}</h3>
            <p>Applied</p>
          </StatCard>
          <StatCard
            status="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.interview}</h3>
            <p>Interview</p>
          </StatCard>
          <StatCard
            status="offer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.offer}</h3>
            <p>Offers</p>
          </StatCard>
          <StatCard
            status="accepted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.accepted}</h3>
            <p>Accepted</p>
          </StatCard>
          <StatCard
            status="rejected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </StatCard>
        </StatsContainer>
        
        {/* Professional Kanban Board */}
        {!jobs || jobs.length === 0 ? (
          <EmptyStateContainer>
            <h3>No Job Applications Yet</h3>
            <p>Start tracking your career journey by adding your first job application!</p>
            <button onClick={() => window.location.href = '/'}>
              Go to Home Page
            </button>
          </EmptyStateContainer>
        ) : (
          <KanbanBoard>
            <AnimatePresence>
              {statusConfig.map(({ key, title, jobs: statusJobs }, index) => (
                <Column
                  key={key}
                  status={key}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ColumnHeader status={key}>
                    <h3>{title}</h3>
                    <div className="count">{statusJobs.length} jobs</div>
                  </ColumnHeader>
                  
                  <JobsList>
                    {key === 'applied' && (
                      <AddJobButton
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/'}
                      >
                        <FaPlus />
                        Add New Application
                      </AddJobButton>
                    )}
                    
                    <AnimatePresence>
                      {statusJobs.length > 0 ? (
                        statusJobs.map((job) => (
                          <ProfessionalJobCard
                            key={job._id || job.id}
                            job={job}
                            onEdit={handleJobUpdate}
                            onDelete={handleJobDelete}
                          />
                        ))
                      ) : (
                        <EmptyState>
                          <div className="empty-icon">📋</div>
                          <p>No jobs in this stage</p>
                        </EmptyState>
                      )}
                    </AnimatePresence>
                  </JobsList>
                </Column>
              ))}
            </AnimatePresence>
          </KanbanBoard>
        )}
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
