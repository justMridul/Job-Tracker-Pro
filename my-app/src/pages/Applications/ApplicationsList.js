// src/pages/Applications/ApplicationsList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import { useHotkeys } from "../../hooks/useHotkeys";
import "./applications.css";

/**
 * ApplicationsList
 * - Local CRUD with localStorage (key: applications)
 * - Search, sort, quick status update
 * - Optimistic delete with 5s Undo bar
 * - Keyboard shortcuts:
 *    "/" focus search, "n" add sample application
 */

const Shell = styled.main`
  min-height: 80vh;
  padding: 20px;
  display: grid;
  place-items: start center;
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled.section`
  width: min(1200px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 8px 28px rgba(0,0,0,.12);
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  width: 320px;
  max-width: 100%;
  transition: border-color .2s, box-shadow .2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color .2s, box-shadow .2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  font-weight: 700;
  transition: border-color .2s, box-shadow .2s, transform .1s ease;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33; }
  &:active { transform: translateY(1px); }
`;

const Primary = styled(Button)`
  background: linear-gradient(135deg, #6ea8ff, #4f7dff);
  border: 0;
  color: #fff;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
  margin-top: 18px;
`;

const AppCard = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const TitleSm = styled.h3`
  margin: 0;
  font-size: 1.05rem;
`;

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: .9rem;
`;

const Chip = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(79,125,255,.12);
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Small = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UndoBar = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(200, 240, 255, .18);
  border: 1px solid rgba(120, 190, 255, .45);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const containerVariants = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const itemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: .35, ease: [0.2, 0.7, 0.2, 1] } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: .25 } },
};

const STORAGE_KEY = "applications";

export default function ApplicationsList() {
  const [apps, setApps] = useState(null); // null while loading
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [pending, setPending] = useState(null); // { app, index, timer }
  const searchRef = useRef(null);

  useHotkeys({
    "/": () => searchRef.current?.focus(),
    n: () => addSample(),
  });

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTimeout(() => {
      try {
        setApps(saved ? JSON.parse(saved) : defaultApplications());
      } catch {
        setApps(defaultApplications());
      }
    }, 250);
  }, []);

  // Persist
  useEffect(() => {
    if (!apps) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch {}
  }, [apps]);

  const filteredSorted = useMemo(() => {
    if (!apps) return [];
    let list = apps;
    const f = q.trim().toLowerCase();
    if (f) {
      list = list.filter((a) =>
        [a.role, a.company, a.location, a.status].some((v) => String(v).toLowerCase().includes(f))
      );
    }
    switch (sort) {
      case "createdAt_asc":
        list = [...list].sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "company_asc":
        list = [...list].sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "status_asc":
        list = [...list].sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "createdAt_desc":
      default:
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    return list;
  }, [apps, q, sort]);

  function addSample() {
    const sample = {
      role: "Frontend Intern",
      company: "Nova Web",
      location: "Remote",
      status: "Applied",
      createdAt: Date.now(),
      notes: "",
    };
    setApps((arr) => [sample, ...(arr || [])]);
  }

  function updateStatus(i, status) {
    setApps((arr) => arr.map((a, idx) => (idx === i ? { ...a, status } : a)));
  }

  function onDelete(i) {
    if (!apps) return;
    const app = apps[i];
    const next = apps.filter((_, idx) => idx !== i);
    setApps(next);
    const t = setTimeout(() => setPending(null), 5000);
    setPending({ app, index: i, timer: t });
  }

  function undoDelete() {
    if (!pending || !apps) return;
    clearTimeout(pending.timer);
    const next = [...apps];
    next.splice(pending.index, 0, pending.app);
    setApps(next);
    setPending(null);
  }
  function commitDelete() {
    if (!pending) return;
    clearTimeout(pending.timer);
    setPending(null);
  }

  if (apps === null) {
    return (
      <Shell>
        <Card>
          <HeaderRow>
            <Title>Applications</Title>
            <Controls>
              <Input placeholder="Search applications…" disabled />
              <Select disabled>
                <option>Sort</option>
              </Select>
              <Primary disabled>New</Primary>
            </Controls>
          </HeaderRow>

          <div className="apps-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} media lines={2} />
            ))}
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <HeaderRow>
          <Title>Applications</Title>
          <Controls>
            <Input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search applications…  (Press / to focus)"
            />
            <Select value={sort} onChange={(e) => setSort(e.target.value)} title="Sort by">
              <option value="createdAt_desc">Newest</option>
              <option value="createdAt_asc">Oldest</option>
              <option value="company_asc">Company A→Z</option>
              <option value="status_asc">Status A→Z</option>
            </Select>
            <Primary onClick={addSample}>New</Primary>
          </Controls>
        </HeaderRow>

        <Grid variants={containerVariants} initial="initial" animate="animate">
          <AnimatePresence>
            {filteredSorted.map((a, i) => (
              <AppCard key={`${a.company}-${a.role}-${a.createdAt}-${i}`} variants={itemVariants} exit="exit">
                <Row>
                  <TitleSm>{a.role}</TitleSm>
                  <Small>{new Date(a.createdAt).toLocaleDateString()}</Small>
                </Row>
                <Muted>{a.company} • {a.location}</Muted>

                <Row>
                  <div className="app-status">
                    <Chip>{a.status}</Chip>
                    <select
                      className="app-status-select"
                      value={a.status}
                      onChange={(e) => updateStatus(i, e.target.value)}
                    >
                      <option>Applied</option>
                      <option>In-review</option>
                      <option>Interview</option>
                      <option>Offer</option>
                      <option>Rejected</option>
                      <option>Accepted</option>
                    </select>
                  </div>

                  <div className="app-actions">
                    <button className="app-btn outline" onClick={() => alert("Edit flow coming soon.")}>Edit</button>
                    <button className="app-btn" onClick={() => onDelete(i)}>Delete</button>
                  </div>
                </Row>
              </AppCard>
            ))}
          </AnimatePresence>
        </Grid>

        {filteredSorted.length === 0 && (
          <div className="apps-empty">
            <h3>No applications found</h3>
            <p>Try adjusting filters or add a new application.</p>
            <Primary onClick={addSample}>Add application</Primary>
          </div>
        )}

        {pending && (
          <UndoBar>
            <span>Application removed.</span>
            <div className="app-actions">
              <button className="app-btn" onClick={undoDelete}>Undo</button>
              <button className="app-btn outline" onClick={commitDelete}>Dismiss</button>
            </div>
          </UndoBar>
        )}
      </Card>
    </Shell>
  );
}

function defaultApplications() {
  return [
    { role: "SDE Intern", company: "Alpha Labs", location: "Remote", status: "Applied", createdAt: Date.now() - 86400000 * 3 },
    { role: "Product Intern", company: "CraftWorks", location: "Pune", status: "Interview", createdAt: Date.now() - 86400000 * 2 },
    { role: "Data Intern", company: "Insight AI", location: "Hyderabad", status: "In-review", createdAt: Date.now() - 86400000 * 5 },
    { role: "Frontend Intern", company: "Pixel Studio", location: "Bengaluru", status: "Offer", createdAt: Date.now() - 86400000 * 1 },
  ];
}
