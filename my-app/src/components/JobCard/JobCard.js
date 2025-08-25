import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import styled, { keyframes, css } from "styled-components";
import { 
  FaEdit, 
  FaTrash, 
  FaBriefcase, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock,
  FaExternalLinkAlt,
  FaEllipsisV 
} from "react-icons/fa";
import Modal from "../Modal";
import ApplicationForm from "../ApplicationForm";

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

// Main Card Container
const Card = styled(motion.article)`
  position: relative;
  background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  border-radius: 20px;
  padding: 28px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 25px rgba(0, 0, 0, 0.08),
    0 20px 40px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0, 0, 0, 0.06)'};
  width: 100%;
  max-width: 380px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: ${slideIn} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ status }) => getStatusGradient(status)};
    border-radius: 20px 20px 0 0;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 8px 12px rgba(0, 0, 0, 0.08),
      0 20px 40px rgba(0, 0, 0, 0.12),
      0 32px 64px rgba(0, 0, 0, 0.08);
    border-color: ${({ theme }) => theme.colors?.primary || '#2563eb'}40;
  }

  ${props => props.isDeleting && css`
    opacity: 0.5;
    transform: scale(0.95);
    animation: ${pulse} 1s infinite;
  `}

  ${props => props.isLoading && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: ${shimmer} 1.5s infinite;
    }
  `}

  @media (max-width: 768px) {
    max-width: 100%;
    margin: 0 16px;
    padding: 24px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled(motion.h2)`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  }
`;

const Company = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  margin-bottom: 4px;

  svg {
    font-size: 14px;
    opacity: 0.8;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  opacity: 0.8;

  svg {
    font-size: 12px;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.7;

  &:hover {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    opacity: 1;
    transform: scale(1.1);
  }

  svg {
    font-size: 16px;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 20px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ status }) => getStatusBackground(status)};
  border: 1px solid ${({ status }) => getStatusBorder(status)};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ status }) => getStatusColor(status)}20;
  color: ${({ status }) => getStatusColor(status)};
  border: 1px solid ${({ status }) => getStatusColor(status)}40;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ status }) => getStatusColor(status)};
  }
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  opacity: 0.8;

  svg {
    font-size: 12px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Description = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const ExtraFields = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ExtraField = styled.div`
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &.edit {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
    }
  }

  &.delete {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 14px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
`;

// Helper functions for status styling
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "applied": return "#3b82f6";
    case "accepted": return "#22c55e";
    case "pending": return "#f59e0b";
    case "interview": return "#8b5cf6";
    case "offer": return "#06b6d4";
    case "rejected": return "#ef4444";
    default: return "#6b7280";
  }
};

const getStatusBackground = (status) => {
  return `${getStatusColor(status)}08`;
};

const getStatusBorder = (status) => {
  return `${getStatusColor(status)}20`;
};

const getStatusGradient = (status) => {
  const color = getStatusColor(status);
  return `linear-gradient(90deg, ${color}, ${color}aa)`;
};

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

const JobCard = ({ job, onDelete, onEdit, isLoading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!job) return null;

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setShowMenu(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async (updatedJob) => {
    try {
      await onEdit(updatedJob);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save job:', error);
      // Keep modal open on error so user can retry
    }
  }, [onEdit]);

  const handleDelete = useCallback(async () => {
    const confirmMessage = `Are you sure you want to delete the application for ${job.title} at ${job.company}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsDeleting(true);
    setShowMenu(false);
    
    try {
      await onDelete(job._id || job.id);
    } catch (error) {
      console.error('Failed to delete job:', error);
      setIsDeleting(false);
    }
  }, [onDelete, job]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Card
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          status={job.status}
          isDeleting={isDeleting}
          isLoading={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CardHeader>
            <TitleSection>
              <Title>
                {job.title || job.roleTitle}
              </Title>
              <Company>
                <FaBuilding />
                {job.company}
              </Company>
              {job.location && (
                <Location>
                  <FaMapMarkerAlt />
                  {job.location}
                </Location>
              )}
            </TitleSection>
          </CardHeader>

          <StatusContainer status={job.status}>
            <StatusBadge status={job.status}>
              {job.status}
            </StatusBadge>
            <DateInfo>
              <FaClock />
              {getRelativeTime(job.dateAdded || job.createdAt)}
            </DateInfo>
          </StatusContainer>

          <CardContent>
            {job.description && (
              <Description>{job.description}</Description>
            )}
            
            {job.extraFields && job.extraFields.length > 0 && (
              <ExtraFields>
                {job.extraFields.slice(0, 3).map((field, index) => (
                  <ExtraField key={index}>
                    {field.label}: {field.value}
                  </ExtraField>
                ))}
                {job.extraFields.length > 3 && (
                  <ExtraField>+{job.extraFields.length - 3} more</ExtraField>
                )}
              </ExtraFields>
            )}
          </CardContent>

          <CardFooter>
            <div>
              {job.deadlineDate && (
                <DateInfo>
                  <FaCalendarAlt />
                  Deadline: {formatDate(job.deadlineDate)}
                </DateInfo>
              )}
            </div>
            
            <QuickActions>
              <ActionButton
                className="edit"
                onClick={handleEditClick}
                disabled={isLoading || isDeleting}
                aria-label="Edit job application"
              >
                <FaEdit />
                Edit
              </ActionButton>
              <ActionButton
                className="delete"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                aria-label="Delete job application"
              >
                <FaTrash />
                Delete
              </ActionButton>
            </QuickActions>
          </CardFooter>
        </Card>
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <Modal 
            isOpen={isEditing} 
            onClose={handleCancel} 
            large
          >
            <ApplicationForm
              initialData={job}
              onSubmit={handleSave}
              onCancel={handleCancel}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    roleTitle: PropTypes.string,
    company: PropTypes.string.isRequired,
    location: PropTypes.string,
    status: PropTypes.string.isRequired,
    description: PropTypes.string,
    dateAdded: PropTypes.string,
    createdAt: PropTypes.string,
    deadlineDate: PropTypes.string,
    extraFields: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default JobCard;
