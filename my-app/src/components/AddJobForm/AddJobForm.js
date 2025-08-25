import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaTimes, FaBriefcase, FaBuilding, FaMapMarkerAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

// Animations
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

// Main Form Container
const FormContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0, 0, 0, 0.06)'};
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #22c55e);
  }

  @media (max-width: 768px) {
    margin: 20px;
    padding: 24px;
    border-radius: 12px;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  p {
    color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
    font-size: 16px;
    line-height: 1.5;
  }
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled(motion.div)`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .required {
    color: #ef4444;
  }

  svg {
    opacity: 0.7;
    font-size: 14px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme, error }) => 
    error ? '#ef4444' : (theme.colors?.border || '#e5e7eb')};
  font-size: 16px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors?.background || '#fafafa'};
  color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors?.primary || '#2563eb'}20;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors?.textSecondary || '#9ca3af'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => props.error && `
    animation: ${shake} 0.5s ease-in-out;
    background-color: #fef2f2;
  `}
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme, error }) => 
    error ? '#ef4444' : (theme.colors?.border || '#e5e7eb')};
  font-size: 16px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors?.background || '#fafafa'};
  color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors?.primary || '#2563eb'}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => props.error && `
    animation: ${shake} 0.5s ease-in-out;
    background-color: #fef2f2;
  `}
`;

const ExtraFieldsSection = styled(motion.div)`
  border: 1px dashed ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  background: ${({ theme }) => theme.colors?.background || '#f9fafb'};

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.textPrimary || '#1a1a1a'};
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ExtraFieldContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #fecaca;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 44px;
  }
`;

const AddFieldButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px dashed ${({ theme }) => theme.colors?.primary || '#2563eb'};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors?.primary || '#2563eb'}10;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MessageContainer = styled(motion.div)`
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  animation: ${slideUp} 0.3s ease;

  &.error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  &.success {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  position: relative;
  overflow: hidden;

  &.primary {
    background: linear-gradient(135deg, #2563eb 0%, #22c55e 100%);
    color: white;
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #22c55e 0%, #2563eb 100%);
      box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
    border: 2px solid ${({ theme }) => theme.colors?.border || '#d1d5db'};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
      transform: translateY(-1px);
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 16px 28px;
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Animation variants
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

// Main Component
const AddJobForm = ({ onAddJob }) => {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    status: 'applied',
    description: '',
    deadline: '',
    interviewDate: '',
  });

  const [extraFields, setExtraFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (form.title.trim().length < 2) {
      newErrors.title = 'Job title must be at least 2 characters';
    }

    if (!form.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (form.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    if (form.location && form.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    // Validate dates
    if (form.deadline) {
      const deadlineDate = new Date(form.deadline);
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = 'Please enter a valid deadline date';
      } else if (deadlineDate < new Date()) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    if (form.interviewDate) {
      const interviewDateObj = new Date(form.interviewDate);
      if (isNaN(interviewDateObj.getTime())) {
        newErrors.interviewDate = 'Please enter a valid interview date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear message when user interacts
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  }, [errors, message.text]);

  const handleExtraFieldChange = useCallback((index, field, value) => {
    setExtraFields(prev => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], [field]: value };
      return newFields;
    });
  }, []);

  const handleAddExtraField = useCallback(() => {
    setExtraFields(prev => [...prev, { label: '', value: '' }]);
  }, []);

  const handleRemoveExtraField = useCallback((index) => {
    setExtraFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const jobData = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim() || 'Remote',
        status: form.status,
        description: form.description.trim(),
        dateAdded: new Date().toISOString(),
        // 🔥 FIXED: Properly format dates for backend
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        interviewDate: form.interviewDate ? new Date(form.interviewDate).toISOString() : null,
        ...(extraFields.length > 0 && { 
          extraFields: extraFields.filter(field => field.label.trim() && field.value.trim())
        })
      };

      console.log('Submitting job data with dates:', jobData); // Debug log

      if (typeof onAddJob === 'function') {
        await onAddJob(jobData);
        
        setMessage({ type: 'success', text: 'Job application added successfully!' });
        
        // Reset form
        setForm({
          title: '',
          company: '',
          location: '',
          status: 'applied',
          description: '',
          deadline: '',
          interviewDate: '',
        });
        setExtraFields([]);
        setErrors({});

        // Clear success message after 4 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 4000);
      } else {
        throw new Error('onAddJob function is not provided');
      }
    } catch (error) {
      console.error('Error adding job:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add job application. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = useCallback(() => {
    setForm({
      title: '',
      company: '',
      location: '',
      status: 'applied',
      description: '',
      deadline: '',
      interviewDate: '',
    });
    setExtraFields([]);
    setErrors({});
    setMessage({ type: '', text: '' });
  }, []);

  return (
    <FormContainer
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <FormHeader>
        <h2>
          <FaBriefcase />
          Add Job Application
        </h2>
        <p>Track your job applications and stay organized in your career journey</p>
      </FormHeader>

      <Form onSubmit={handleSubmit} noValidate>
        {/* Basic Information */}
        <FormRow columns="1fr 1fr">
          <FormGroup variants={itemVariants}>
            <Label htmlFor="title">
              <FaBriefcase />
              Job Title <span className="required">*</span>
            </Label>
            <InputWrapper>
              <Input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer"
                disabled={isSubmitting}
                error={!!errors.title}
                required
              />
              {errors.title && <MessageContainer className="error" style={{ marginTop: '8px', padding: '8px 12px' }}>
                <FaExclamationTriangle />
                {errors.title}
              </MessageContainer>}
            </InputWrapper>
          </FormGroup>

          <FormGroup variants={itemVariants}>
            <Label htmlFor="company">
              <FaBuilding />
              Company <span className="required">*</span>
            </Label>
            <InputWrapper>
              <Input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g., Google, Apple, Microsoft"
                disabled={isSubmitting}
                error={!!errors.company}
                required
              />
              {errors.company && <MessageContainer className="error" style={{ marginTop: '8px', padding: '8px 12px' }}>
                <FaExclamationTriangle />
                {errors.company}
              </MessageContainer>}
            </InputWrapper>
          </FormGroup>
        </FormRow>

        <FormRow columns="1fr 1fr">
          <FormGroup variants={itemVariants}>
            <Label htmlFor="location">
              <FaMapMarkerAlt />
              Location
            </Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., New York, NY or Remote"
              disabled={isSubmitting}
              error={!!errors.location}
            />
            {errors.location && <MessageContainer className="error" style={{ marginTop: '8px', padding: '8px 12px' }}>
              <FaExclamationTriangle />
              {errors.location}
            </MessageContainer>}
          </FormGroup>

          <FormGroup variants={itemVariants}>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="applied">Applied</option>
              <option value="pending">Pending</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </Select>
          </FormGroup>
        </FormRow>

        {/* 🔥 Date Fields Section */}
        <FormRow columns="1fr 1fr">
          <FormGroup variants={itemVariants}>
            <Label htmlFor="deadline">
              <FaCalendarAlt />
              Application Deadline
            </Label>
            <InputWrapper>
              <Input
                type="date"
                id="deadline"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.deadline}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && <MessageContainer className="error" style={{ marginTop: '8px', padding: '8px 12px' }}>
                <FaExclamationTriangle />
                {errors.deadline}
              </MessageContainer>}
            </InputWrapper>
          </FormGroup>

          <FormGroup variants={itemVariants}>
            <Label htmlFor="interviewDate">
              <FaCalendarAlt />
              Interview Date
            </Label>
            <InputWrapper>
              <Input
                type="date"
                id="interviewDate"
                name="interviewDate"
                value={form.interviewDate}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!errors.interviewDate}
              />
              {errors.interviewDate && <MessageContainer className="error" style={{ marginTop: '8px', padding: '8px 12px' }}>
                <FaExclamationTriangle />
                {errors.interviewDate}
              </MessageContainer>}
            </InputWrapper>
          </FormGroup>
        </FormRow>

        <FormGroup variants={itemVariants}>
          <Label htmlFor="description">Job Description</Label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the role, responsibilities, or requirements..."
            disabled={isSubmitting}
            rows={4}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `2px solid ${errors.description ? '#ef4444' : '#e5e7eb'}`,
              fontSize: '16px',
              fontFamily: 'inherit',
              background: '#fafafa',
              color: '#1a1a1a',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </FormGroup>

        {/* Extra Fields Section */}
        <ExtraFieldsSection variants={itemVariants}>
          <h3>
            <FaPlus />
            Additional Information
          </h3>
          
          {extraFields.map((field, index) => (
            <ExtraFieldContainer key={index}>
              <Input
                type="text"
                name="label"
                placeholder="Field name (e.g., Salary Range)"
                value={field.label}
                onChange={(e) => handleExtraFieldChange(index, 'label', e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                type="text"
                name="value"
                placeholder="Value (e.g., $80k-100k)"
                value={field.value}
                onChange={(e) => handleExtraFieldChange(index, 'value', e.target.value)}
                disabled={isSubmitting}
              />
              <RemoveButton
                type="button"
                onClick={() => handleRemoveExtraField(index)}
                disabled={isSubmitting}
                aria-label="Remove field"
              >
                <FaTimes />
              </RemoveButton>
            </ExtraFieldContainer>
          ))}

          <AddFieldButton
            type="button"
            onClick={handleAddExtraField}
            disabled={isSubmitting}
          >
            <FaPlus />
            Add Custom Field
          </AddFieldButton>
        </ExtraFieldsSection>

        {/* Messages */}
        {message.text && (
          <MessageContainer className={message.type} variants={itemVariants}>
            {message.type === 'error' ? <FaExclamationTriangle /> : <FaCheck />}
            {message.text}
          </MessageContainer>
        )}

        {/* Action Buttons */}
        <ButtonGroup variants={itemVariants}>
          <ActionButton
            type="button"
            className="secondary"
            onClick={handleClear}
            disabled={isSubmitting}
          >
            <FaTimes />
            Clear Form
          </ActionButton>

          <ActionButton
            type="submit"
            className="primary"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? (
              <LoadingSpinner>
                <FaSpinner />
                Adding...
              </LoadingSpinner>
            ) : (
              <>
                <FaCheck />
                Add Job Application
              </>
            )}
          </ActionButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default AddJobForm;
