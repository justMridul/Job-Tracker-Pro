// src/pages/Internships/InternshipsList.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useSavedViews } from "../../hooks/useSavedViews";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import { useHotkeys } from "../../hooks/useHotkeys";
import "./internships.css";

/**
 * InternshipsList
 * - Local CRUD with persistence in localStorage (key: internships)
 * - Search/filter, saved views, optimistic delete with undo (snackbar-like inline)
 * - Keyboard shortcuts: "/" focus search, "n" new item
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

const ViewsBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ViewPill = styled.button`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ active }) => (active ? "#fff" : "inherit")};
  cursor: pointer;
  font-size: 12px;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  margin-top: 18px;
`;

const CardItem = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 8px;
`;

const ItemTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
`;
const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: .9rem;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const Tag = styled.span`
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
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 200, 120, .15);
  border: 1px solid rgba(255, 200, 120, .35);
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

const STORAGE_KEY = "internships";

export default function InternshipsList() {
  const [items, setItems] = useState(null); // null while loading
  const [q, setQ] = useState("");
  const [pending, setPending] = useState(null); // { item, index, timer }
  const [activeViewId, setActiveViewId] = useState(null);
  const searchRef = React.useRef(null);

  // Saved views (local)
  const { views, addView, removeView, renameView, togglePin } = useSavedViews("internships");

  // Hotkeys
  useHotkeys({
    "/": () => searchRef.current?.focus(),
    n: () => addNew(),
  });

  // Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTimeout(() => {
      try {
        setItems(saved ? JSON.parse(saved) : defaultInternships());
      } catch {
        setItems(defaultInternships());
      }
    }, 250); // show skeleton briefly
  }, []);

  // Persist
  useEffect(() => {
    if (!items) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const f = q.trim().toLowerCase();
    if (!f) return items;
    return items.filter((it) =>
      [it.title, it.company, it.location, it.type].some((v) => String(v).toLowerCase().includes(f))
    );
  }, [items, q]);

  function addNew() {
    const sample = {
      title: "New Internship",
      company: "Awesome Co",
      location: "Remote",
      type: "Summer",
      stipend: "₹20,000",
      status: "Interested",
    };
    setItems((arr) => [sample, ...(arr || [])]);
  }

  function onDelete(idx) {
    if (!items) return;
    const item = items[idx];
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    // schedule undo
    const t = setTimeout(() => setPending(null), 5000);
    setPending({ item, index: idx, timer: t });
  }

  function undoDelete() {
    if (!pending || !items) return;
    clearTimeout(pending.timer);
    const next = [...items];
    next.splice(pending.index, 0, pending.item);
    setItems(next);
    setPending(null);
  }

  function commitDelete() {
    if (!pending) return;
    clearTimeout(pending.timer);
    setPending(null);
  }

  function saveCurrentView() {
    const v = addView({ name: `View ${views.length + 1}`, query: q ? `?q=${encodeURIComponent(q)}` : "" });
    setActiveViewId(v?.id || null);
  }

  if (items === null) {
    // Loading skeletons
    return (
      <Shell>
        <Card>
          <HeaderRow>
            <Title>Internships</Title>
            <Controls>
              <Input placeholder="Search internships…" disabled />
              <Primary disabled>New</Primary>
              <Button disabled>Save view</Button>
            </Controls>
          </HeaderRow>
          <div className="internships-grid">
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
          <Title>Internships</Title>
          <Controls>
            <Input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search internships…  (Press / to focus)"
            />
            <Primary onClick={addNew}>New</Primary>
            <Button onClick={saveCurrentView}>Save view</Button>
          </Controls>
        </HeaderRow>

        {views.length > 0 && (
          <ViewsBar>
            {views.map((v) => {
              const active = v.id === activeViewId;
              return (
                <ViewPill key={v.id} active={active} onClick={() => setActiveViewId(v.id)} title={v.name}>
                  {v.pinned ? "📌 " : ""}
                  {v.name}
                </ViewPill>
              );
            })}
          </ViewsBar>
        )}

        <Grid variants={containerVariants} initial="initial" animate="animate">
          <AnimatePresence>
            {filtered.map((it, idx) => (
              <CardItem key={`${it.title}-${it.company}-${idx}`} variants={itemVariants} exit="exit">
                <ItemTitle>{it.title}</ItemTitle>
                <Muted>{it.company} • {it.location}</Muted>
                <Row>
                  <Tag>{it.type}</Tag>
                  <Small>{it.stipend}</Small>
                </Row>
                <Row>
                  <Small>Status: {it.status}</Small>
                  <div className="intern-actions">
                    <button className="intern-btn" onClick={() => onDelete(idx)}>Delete</button>
                    <button
                      className="intern-btn outline"
                      onClick={() => alert("Edit form can be added here.")}
                    >
                      Edit
                    </button>
                  </div>
                </Row>
              </CardItem>
            ))}
          </AnimatePresence>
        </Grid>

        {filtered.length === 0 && (
          <div className="intern-empty">
            <h3>No internships found</h3>
            <p>Try clearing the search or add a new internship.</p>
            <Primary onClick={addNew}>Add internship</Primary>
          </div>
        )}

        {pending && (
          <UndoBar>
            <span>Internship removed.</span>
            <div className="intern-actions">
              <button className="intern-btn" onClick={undoDelete}>Undo</button>
              <button className="intern-btn outline" onClick={commitDelete}>Dismiss</button>
            </div>
          </UndoBar>
        )}
      </Card>
    </Shell>
  );
}

function defaultInternships() {
  return [
    { title: "SDE Intern", company: "Alpha Labs", location: "Remote", type: "Summer", stipend: "₹25,000", status: "Applied" },
    { title: "Frontend Intern", company: "Pixel Studio", location: "Bengaluru", type: "6 months", stipend: "₹20,000", status: "Interview" },
    { title: "Data Intern", company: "Insight AI", location: "Hyderabad", type: "Winter", stipend: "₹30,000", status: "Interested" },
    { title: "Product Intern", company: "CraftWorks", location: "Pune", type: "Summer", stipend: "₹22,000", status: "Pending" },
  ];
}
