import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Modal from "./Modal";                 // ✅ fixed path
import ApplicationForm from "./ApplicationForm"; // ✅ fixed path
import JobCard from "./JobCard/JobCard";

// Styled Components (theme-safe fallbacks)
const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
  height: 100%;
  overflow-x: auto;
  padding: 16px 0;
  min-height: 600px;
`;
const Column = styled.div`
  flex: 1;
  min-width: 280px;
  background: ${({ theme }) => theme?.colors?.surface || "#fff"};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || "0 1px 4px rgba(0,0,0,.08)"};
  border: ${({ isDragOver, theme }) =>
    isDragOver
      ? `2px dashed ${theme?.colors?.primary || "#2563eb"}`
      : `2px solid ${theme?.colors?.border || "#e5e7eb"}`};
  transition: border-color 0.2s ease;
`;
const ColumnHeader = styled.h3`
  margin: 0 0 16px 0;
  padding: 8px 12px;
  background: ${({ theme, status }) => getStatusColor(status, theme)};
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
`;
const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
`;
const AddButton = styled.button`
  margin-bottom: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme?.colors?.primary || "#2563eb"};
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s ease;
  &:hover { background-color: ${({ theme }) => theme?.colors?.secondary || "#1e40af"}; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;
const EmptyColumn = styled.div`
  text-align: center;
  color: ${({ theme }) => theme?.colors?.textSecondary || "#64748b"};
  font-style: italic;
  padding: 40px 20px;
  border: 2px dashed ${({ theme }) => theme?.colors?.border || "#e5e7eb"};
  border-radius: 8px;
  background: ${({ theme }) => theme?.colors?.background || "#f8fafc"};
`;
const ErrorMessage = styled.div`
  color: ${({ theme }) => theme?.colors?.error || "#ef4444"};
  background: ${({ theme }) => theme?.colors?.surface || "#fff"};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 16px 0;
`;

// helpers
const getStatusColor = (status, theme) => {
  const c = theme?.colors || {};
  switch (status) {
    case "applied":   return c.info     || "#3b82f6";
    case "interview": return c.warning  || "#f59e0b";
    case "offer":     return c.success  || "#22c55e";
    case "accepted":  return c.success  || "#22c55e";
    case "rejected":  return c.error    || "#ef4444";
    default:          return c.primary  || "#2563eb";
  }
};

const statuses = [
  { id: "applied", title: "Applied" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
  { id: "accepted", title: "Accepted" },
  { id: "rejected", title: "Rejected" },
];

function KanbanBoard({ jobs, getJobsByStatus, onJobUpdate, onJobDelete, onJobAdd, error, isLoading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [draggedJobId, setDraggedJobId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const applicationsByStatus = useMemo(() => {
    if (!jobs || !getJobsByStatus) return {};
    const grouped = {};
    statuses.forEach(({ id }) => {
      const statusJobs = getJobsByStatus(id) || [];
      grouped[id] = statusJobs.map(job => ({
        _id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        status: id,
        dateAdded: job.dateAdded,
        extraFields: job.extraFields,
        roleTitle: job.title,
      }));
    });
    return grouped;
  }, [jobs, getJobsByStatus]);

  const handleEdit = (job) => { setEditingApplication(job); setModalOpen(true); };
  const handleCloseModal = () => { setEditingApplication(null); setModalOpen(false); };

  const handleSave = async (updatedJob) => {
    if (!onJobUpdate) return;
    await onJobUpdate(updatedJob._id, {
      title: updatedJob.title || updatedJob.roleTitle,
      company: updatedJob.company,
      location: updatedJob.location,
      status: updatedJob.status,
      extraFields: updatedJob.extraFields,
      deadlineDate: updatedJob.deadlineDate,
      interviewDate: updatedJob.interviewDate,
      resumeVersion: updatedJob.resumeVersion,
      links: updatedJob.links,
      notes: updatedJob.notes,
    });
    handleCloseModal();
  };

  const handleAddSave = async (newJob) => {
    if (!onJobAdd) return;
    await onJobAdd({
      title: newJob.title || newJob.roleTitle,
      company: newJob.company,
      location: newJob.location,
      status: newJob.status || "applied",
      extraFields: newJob.extraFields,
      deadlineDate: newJob.deadlineDate,
      interviewDate: newJob.interviewDate,
      resumeVersion: newJob.resumeVersion,
      links: newJob.links,
      notes: newJob.notes,
    });
    setAddModalOpen(false);
  };

  const handleDelete = async (jobId) => { if (onJobDelete) await onJobDelete(jobId); };

  const handleDragStart = (event) => { setDraggedJobId(event.active.id); };
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setDragOverColumn(null); setDraggedJobId(null);
    if (!over) return;
    const draggedJob = Object.values(applicationsByStatus).flat().find(j => j._id === active.id);
    if (!draggedJob) return;
    const newStatus = over.data?.current?.status;
    if (draggedJob.status !== newStatus && onJobUpdate) {
      try { await onJobUpdate(draggedJob._id, { status: newStatus }); } catch (e) { console.error(e); }
    }
  };
  const handleDragOver = (event) => { setDragOverColumn(event.over?.data?.current?.status || null); };

  const totalJobs = useMemo(
    () => Object.values(applicationsByStatus).reduce((t, arr) => t + arr.length, 0),
    [applicationsByStatus]
  );

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <AddButton onClick={() => setAddModalOpen(true)} disabled={isLoading} aria-label="Add new job application">
          + Add Job Application
        </AddButton>
        <div style={{ fontSize:14, opacity:0.7 }}>Total: {totalJobs} jobs</div>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <BoardContainer>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {statuses.map(({ id, title }) => {
            const columnJobs = applicationsByStatus[id] || [];
            return (
              <Column key={id} isDragOver={dragOverColumn === id} data-status={id}>
                <ColumnHeader status={id}>{title} ({columnJobs.length})</ColumnHeader>
                <JobList>
                  <SortableContext items={columnJobs.map(j => j._id)} strategy={verticalListSortingStrategy}>
                    {columnJobs.length === 0 ? (
                      <EmptyColumn>
                        <div>No jobs in this stage</div>
                        {id === "applied" && totalJobs === 0 && (
                          <small style={{ display:"block", marginTop:8, opacity:0.7 }}>
                            Add your first job application above!
                          </small>
                        )}
                      </EmptyColumn>
                    ) : (
                      columnJobs.map(job => (
                        <div key={job._id} data-id={job._id} data-status={id} style={{ opacity: draggedJobId === job._id ? 0.5 : 1 }}>
                          <JobCard job={job} onEdit={() => handleEdit(job)} onDelete={() => handleDelete(job._id)} isLoading={isLoading} />
                        </div>
                      ))
                    )}
                  </SortableContext>
                </JobList>
              </Column>
            );
          })}
        </DndContext>
      </BoardContainer>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} large>
        {editingApplication && (
          <ApplicationForm initialData={editingApplication} onSubmit={handleSave} onCancel={handleCloseModal} />
        )}
      </Modal>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} large>
        <ApplicationForm onSubmit={handleAddSave} onCancel={() => setAddModalOpen(false)} />
      </Modal>
    </>
  );
}
export default KanbanBoard;
