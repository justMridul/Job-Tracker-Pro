// src/context/JobContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const JobContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('/jobs');
      const jobsArray = Array.isArray(data) ? data : (data.jobs || data.data || []);
      setJobs(jobsArray);
      console.log('Jobs fetched from backend:', jobsArray);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message || 'Failed to load jobs');
      
      // Fallback to localStorage
      try {
        const localJobs = localStorage.getItem('jobs');
        if (localJobs) {
          setJobs(JSON.parse(localJobs));
          console.log('Loaded fallback jobs from localStorage');
        }
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (jobData) => {
    try {
      setError(null);
      
      const jobPayload = {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || 'Not specified',
        status: jobData.status || 'Applied',
        dateAdded: new Date().toISOString(),
        ...(jobData.extraFields && { extraFields: jobData.extraFields }),
      };

      const newJob = await apiCall('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobPayload),
      });

      setJobs(prevJobs => [newJob, ...prevJobs]);
      localStorage.setItem('jobs', JSON.stringify([newJob, ...jobs]));
      
      console.log('Job added successfully:', newJob);
      return newJob;
    } catch (error) {
      console.error('Failed to add job:', error);
      setError(error.message || 'Failed to add job');
      
      // Fallback: add to localStorage
      const fallbackJob = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...jobData,
        dateAdded: new Date().toISOString(),
      };
      
      setJobs(prevJobs => [fallbackJob, ...prevJobs]);
      localStorage.setItem('jobs', JSON.stringify([fallbackJob, ...jobs]));
      
      throw error;
    }
  }, [jobs]);

  const deleteJob = useCallback(async (jobId) => {
    try {
      setError(null);
      
      await apiCall(`/jobs/${jobId}`, {
        method: 'DELETE',
      });

      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      
      console.log('Job deleted successfully:', jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
      setError(error.message || 'Failed to delete job');
      
      // Still update locally as fallback
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      
      throw error;
    }
  }, [jobs]);

  const updateJob = useCallback(async (jobId, updates) => {
    try {
      setError(null);
      
      const updatedJob = await apiCall(`/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const updatedJobs = jobs.map(job => job.id === jobId ? updatedJob : job);
      setJobs(updatedJobs);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      
      console.log('Job updated successfully:', updatedJob);
      return updatedJob;
    } catch (error) {
      console.error('Failed to update job:', error);
      setError(error.message || 'Failed to update job');
      
      // Fallback: update locally
      const updatedJobs = jobs.map(job => job.id === jobId ? { ...job, ...updates } : job);
      setJobs(updatedJobs);
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      
      throw error;
    }
  }, [jobs]);

  const getJobsByStatus = useCallback((status) => {
    return jobs.filter(job => job.status.toLowerCase() === status.toLowerCase());
  }, [jobs]);

  const getJobStats = useCallback(() => {
    const counts = {};
    jobs.forEach(job => {
      const st = job.status.toLowerCase();
      counts[st] = (counts[st] || 0) + 1;
    });
    
    return {
      total: jobs.length,
      applied: counts['applied'] || 0,
      interview: counts['interview'] || 0,
      pending: counts['pending'] || 0,
      offer: counts['offer'] || 0,
      accepted: counts['accepted'] || 0,
      rejected: counts['rejected'] || 0,
    };
  }, [jobs]);

  const clearAllJobs = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete all jobs?')) {
      return;
    }

    try {
      setError(null);
      
      // Call backend to clear all jobs if supported
      await apiCall('/jobs', { method: 'DELETE' });
      
      setJobs([]);
      localStorage.removeItem('jobs');
      
      console.log('All jobs cleared successfully');
    } catch (error) {
      console.error('Failed to clear all jobs:', error);
      setError(error.message || 'Failed to clear all jobs');
      
      // Fallback: clear locally
      setJobs([]);
      localStorage.removeItem('jobs');
    }
  }, []);

  const refreshJobs = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        error,
        addJob,
        deleteJob,
        updateJob,
        getJobsByStatus,
        getJobStats,
        clearAllJobs,
        refreshJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export { JobContext };
