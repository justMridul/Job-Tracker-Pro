import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Input = styled.input`
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c0c7ce'};
  background-color: ${({ theme }) => theme.colors.surface || 'white'};
  color: ${({ theme }) => theme.colors.textPrimary || '#1e293b'};
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary || '#2563eb'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c0c7ce'};
  background-color: ${({ theme }) => theme.colors.surface || 'white'};
  color: ${({ theme }) => theme.colors.textPrimary || '#1e293b'};
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary || '#2563eb'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border || '#c0c7ce'};
  background-color: ${({ theme }) => theme.colors.surface || 'white'};
  color: ${({ theme }) => theme.colors.textPrimary || '#1e293b'};
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary || '#2563eb'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  flex: 1;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #1e40af;
  }

  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border || '#c0c7ce'};
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  flex: 1;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary || '#1e293b'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.border || '#c0c7ce'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LinkInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #dc2626;
  }
`;

const AddLinkButton = styled.button`
  background: #22c55e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 8px;

  &:hover {
    background: #16a34a;
  }
`;

function ApplicationForm({ initialData = {}, onSubmit, onCancel, isLoading = false }) {
  const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : null);

  const [formData, setFormData] = useState({
    company: initialData.company || "",
    title: initialData.title || initialData.roleTitle || "",
    status: initialData.status || "applied",
    location: initialData.location || "",
    deadlineDate: parseDate(initialData.deadlineDate),
    interviewDate: parseDate(initialData.interviewDate),
    resumeVersion: initialData.resumeVersion || "",
    links: Array.isArray(initialData.links) && initialData.links.length
      ? initialData.links
      : [{ label: "", url: "" }],
    notes: initialData.notes || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.company.trim()) newErrors.company = "Company is required.";
    if (!formData.title.trim()) newErrors.title = "Job title is required.";
    if (!formData.status.trim()) newErrors.status = "Status is required.";

    const isValidUrl = (url) => {
      if (!url) return true;
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return pattern.test(url);
    };

    formData.links.forEach((link, i) => {
      if (link.url && !isValidUrl(link.url)) {
        if (!newErrors.links) newErrors.links = {};
        newErrors.links[i] = "Invalid URL.";
      }
    });

    if (formData.deadlineDate && formData.interviewDate) {
      if (formData.interviewDate < formData.deadlineDate) {
        newErrors.interviewDate = "Interview date cannot be before deadline date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validate();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }],
    }));
  };

  const removeLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      if (!prev.links) return prev;
      const newLinksErrors = { ...prev.links };
      delete newLinksErrors[index];
      return { ...prev, links: newLinksErrors };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const outputData = {
      ...initialData, // Preserve existing data like _id
      company: formData.company,
      title: formData.title,
      roleTitle: formData.title, // For compatibility
      status: formData.status,
      location: formData.location,
      deadlineDate: formData.deadlineDate
        ? formData.deadlineDate.toISOString().split("T")[0]
        : "",
      interviewDate: formData.interviewDate
        ? formData.interviewDate.toISOString().split("T")[0]
        : "",
      resumeVersion: formData.resumeVersion,
      links: formData.links.filter((link) => link.url.trim() !== ""),
      notes: formData.notes,
    };

    if (typeof onSubmit === "function") {
      try {
        await onSubmit(outputData);
      } catch (error) {
        console.error("Form submission failed:", error);
        // Form will stay open for user to retry
      }
    } else {
      console.error("onSubmit prop is not a function.");
    }
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{initialData._id || initialData.id ? 'Edit Job Application' : 'Add Job Application'}</h2>
      
      <FormGroup>
        <Label htmlFor="company">Company *</Label>
        <Input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.company && <ErrorText>{errors.company}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.title && <ErrorText>{errors.title}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., New York, NY or Remote"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="status">Status *</Label>
        <Select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={isLoading}
          required
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </Select>
        {errors.status && <ErrorText>{errors.status}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label>Deadline Date</Label>
        <DatePicker
          selected={formData.deadlineDate}
          onChange={(date) => handleDateChange("deadlineDate", date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select deadline date"
          customInput={<Input />}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label>Interview Date</Label>
        <DatePicker
          selected={formData.interviewDate}
          onChange={(date) => handleDateChange("interviewDate", date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select interview date"
          customInput={<Input />}
          disabled={isLoading}
        />
        {errors.interviewDate && <ErrorText>{errors.interviewDate}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="resumeVersion">Resume Version</Label>
        <Input
          id="resumeVersion"
          name="resumeVersion"
          type="text"
          value={formData.resumeVersion}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Software Engineer v2.1"
        />
      </FormGroup>

      <FormGroup>
        <Label>Links</Label>
        {formData.links.map((link, index) => (
          <LinkContainer key={index}>
            <LinkInput
              type="text"
              placeholder="Label"
              value={link.label}
              onChange={(e) => handleLinkChange(index, "label", e.target.value)}
              disabled={isLoading}
            />
            <LinkInput
              type="url"
              placeholder="URL"
              value={link.url}
              onChange={(e) => handleLinkChange(index, "url", e.target.value)}
              disabled={isLoading}
            />
            {formData.links.length > 1 && (
              <RemoveButton
                type="button"
                onClick={() => removeLink(index)}
                disabled={isLoading}
              >
                Remove
              </RemoveButton>
            )}
          </LinkContainer>
        ))}
        {errors.links && (
          <ErrorText>
            {Object.values(errors.links).join(", ")}
          </ErrorText>
        )}
        <AddLinkButton
          type="button"
          onClick={addLink}
          disabled={isLoading}
        >
          Add Link
        </AddLinkButton>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Add any additional notes about this application..."
        />
      </FormGroup>

      <ButtonGroup>
        <CancelButton
          type="button"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </CancelButton>
        <SubmitButton
          type="submit"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Saving...' : (initialData._id || initialData.id ? 'Update Job' : 'Add Job')}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
}

export default ApplicationForm;
