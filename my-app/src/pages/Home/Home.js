import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import JobCard from "../../components/JobCard/JobCard";
import AddJobForm from "../../components/AddJobForm/AddJobForm";
import { useJobs } from "../../context/JobContext";

// Styled components
const Container = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.background};
  padding: 20px;
  box-sizing: border-box;
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 48px 60px;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  max-width: 1400px;
  width: 95%;
  min-height: calc(100vh - 100px);
  text-align: center;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color .25s ease, color .25s ease, border-color .25s ease;

  @media (max-width: 1024px) {
    width: 90%;
    padding: 40px 48px;
  }

  @media (max-width: 768px) {
    width: 95%;
    padding: 32px 24px;
  }

  @media (max-width: 480px) {
    width: 98%;
    padding: 24px 16px;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }

  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
`;

const Description = styled.p`
  font-size: 1.3rem;
  margin-bottom: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin: 32px 0 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FilterInput = styled.input`
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 1.1rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  width: 400px;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 16px 0 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px 24px;
  text-align: center;
  min-width: 120px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    font-size: 0.9rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const JobList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-top: 40px;
  text-align: left;
  padding: 0 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
`;

const ContentSection = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

// Animation variants
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
};

const Home = () => {
  // Use JobContext with backend integration
  const { jobs, loading, error, addJob, deleteJob, updateJob, getJobStats, refreshJobs } = useJobs();

  // Filter state (keep local as it's UI-specific)
  const [filter, setFilter] = useState("");

  // Get job statistics from context
  const stats = getJobStats();

  // Derived filtered jobs (memoized)
  const filteredJobs = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return jobs;

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(f) ||
        job.company.toLowerCase().includes(f) ||
        (job.location && job.location.toLowerCase().includes(f)) ||
        job.status.toLowerCase().includes(f)
    );
  }, [jobs, filter]);

  // Add new job using context (with backend)
  const handleAddJob = async (jobData) => {
    try {
      console.log('Adding job via context:', jobData);
      await addJob(jobData);
    } catch (error) {
      console.error('Failed to add job:', error);
      // AddJobForm will handle the error display
    }
  };

  // Delete job using context (with backend)
  const handleDeleteJob = async (jobId) => {
    try {
      console.log('Deleting job via context:', jobId);
      await deleteJob(jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
      // Error handling can be improved with toast notifications
    }
  };

  // Edit job using context (with backend)
  const handleEditJob = async (jobId, updatedJob) => {
    try {
      console.log('Updating job via context:', jobId, updatedJob);
      await updateJob(jobId, updatedJob);
    } catch (error) {
      console.error('Failed to update job:', error);
      // Error handling can be improved with toast notifications
      throw error; // Re-throw so JobCard can handle it
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Container>
        <Card>
          <LoadingContainer>
            Loading your job applications...
          </LoadingContainer>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <ContentSection>
          <Title>Welcome to Job Internship Tracker</Title>
          <Description>
            Track job applications and internships efficiently in one place.
            Organize your career journey with our comprehensive tracking system.
          </Description>

          {/* Statistics from JobContext */}
          <StatsContainer>
            <StatCard>
              <h3>{stats.total}</h3>
              <p>Total Applications</p>
            </StatCard>
            <StatCard>
              <h3>{stats.applied}</h3>
              <p>Applied</p>
            </StatCard>
            <StatCard>
              <h3>{stats.interview}</h3>
              <p>Interviews</p>
            </StatCard>
            <StatCard>
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </StatCard>
            <StatCard>
              <h3>{stats.offer}</h3>
              <p>Offers</p>
            </StatCard>
          </StatsContainer>

          <ControlsRow>
            <AddJobForm onAddJob={handleAddJob} />
            
            <FilterInput
              type="text"
              placeholder="Filter jobs by title, company, location, or status..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </ControlsRow>

          {/* Job List or Empty State */}
          {filteredJobs.length === 0 ? (
            <EmptyState>
              {jobs.length === 0 ? (
                <>
                  <h3>No Job Applications Yet</h3>
                  <p>Start tracking your career journey by adding your first job application above!</p>
                </>
              ) : (
                <>
                  <h3>No Results Found</h3>
                  <p>Try adjusting your search terms or clear the filter to see all jobs.</p>
                </>
              )}
            </EmptyState>
          ) : (
            <JobList
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="wait">
                {filteredJobs.map((job, index) => {
                  // Create safe key - fixes React warning
                  const safeKey = job.id || `${job.title}-${job.company}-${index}`;

                  return (
                    <motion.div key={safeKey} variants={itemVariants}>
                      <JobCard
                        job={job}
                        onDelete={() => handleDeleteJob(job.id)}
                        onEdit={(updatedJob) => handleEditJob(job.id, updatedJob)}
                        isLoading={loading}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </JobList>
          )}
        </ContentSection>
      </Card>
    </Container>
  );
};

export default Home;
