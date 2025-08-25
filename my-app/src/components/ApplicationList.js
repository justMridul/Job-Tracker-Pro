import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import styled, { keyframes } from "styled-components";
import API from "../utils/api";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  max-width: 960px;
  margin: 40px auto;
  padding: 30px 40px;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

  @media (max-width: 768px) {
    padding: 20px 24px;
    margin: 20px 16px;
  }
  @media (max-width: 480px) {
    padding: 16px 16px;
    margin: 10px 8px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 24px;
  color: #222;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1.2px;

  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1 1 300px;
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  transition: border-color 0.3s;

  &:focus {
    border-color: #1976d2;
    outline: none;
  }
`;

const Select = styled.select`
  flex: 0 0 150px;
  padding: 8px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;

  &:focus {
    border-color: #1976d2;
    outline: none;
  }
`;

const JumpInput = styled.input`
  flex: 0 0 80px;
  padding: 8px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  text-align: center;

  &:focus {
    border-color: #1976d2;
    outline: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
`;

const Thead = styled.thead`
  background-color: #e3f2fd;
`;

const Th = styled.th`
  padding: 14px 18px;
  text-align: left;
  font-weight: 700;
  user-select: none;
  cursor: pointer;
  color: #1976d2;
  position: relative;

  &:focus {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
  }
`;

const SortArrow = styled.span`
  margin-left: 6px;
  font-size: 0.75rem;
  user-select: none;
`;

const Tr = styled.tr`
  background-color: ${(props) => (props.even ? "#fafafa" : "#fff")};
  animation: ${fadeIn} 0.3s ease forwards;

  &:hover {
    background-color: #e3f2fd;
  }
`;

const Td = styled.td`
  padding: 14px 18px;
  vertical-align: middle;
`;

const StatusTag = styled.span`
  padding: 5px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 20px;
  text-transform: capitalize;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case "applied":
        return "#0288d1";
      case "in-review":
        return "#fbc02d";
      case "interview":
        return "#1976d2";
      case "accepted":
        return "#388e3c";
      case "rejected":
        return "#d32f2f";
      default:
        return "#757575";
    }
  }};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: #1976d2;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.4);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #1565c0;
    box-shadow: 0 6px 18px rgba(21, 101, 192, 0.6);
    cursor: pointer;
  }

  &:disabled {
    background-color: #90caf9;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: #424242;
  min-width: 140px;
  text-align: center;
`;

const LoadingRow = styled.tr`
  td {
    padding: 20px;
  }
`;

const LoadingSkeleton = styled.div`
  height: 18px;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(200, 200, 200, 0.15) 25%,
    rgba(220, 220, 220, 0.3) 37%,
    rgba(200, 200, 200, 0.15) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const ApplicationList = () => {
  const {
    currentUser,
    applicationsCache,
    updateApplicationsCache,
  } = useAppContext();

  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const userId = currentUser?._id || currentUser?.id;

  const cacheKey = `${userId}-${currentPage}-${limit}-${sortField}-${sortDir}-${searchQuery.trim()}`;

  const fetchApplications = useCallback(
    async (page = 1) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      if (applicationsCache[cacheKey]) {
        setApplications(applicationsCache[cacheKey].items);
        setCurrentPage(applicationsCache[cacheKey].page);
        setTotalPages(applicationsCache[cacheKey].totalPages);
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/applications/user/${userId}`, {
          params: {
            page,
            limit,
            sortBy: sortField,
            sortDir,
            q: searchQuery.trim(),
          },
        });
        setApplications(res.data.items);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
        updateApplicationsCache(userId, page, res.data);
      } catch {
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    },
    [
      userId,
      currentPage,
      limit,
      sortField,
      sortDir,
      searchQuery,
      cacheKey,
      applicationsCache,
      updateApplicationsCache,
    ]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchApplications(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchApplications]);

  useEffect(() => {
    fetchApplications(currentPage);
  }, [fetchApplications, currentPage]);

  const handleJumpPageChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setJumpPage(e.target.value);
    }
  };

  const handleJumpPageSubmit = () => {
    let pageNum = Number(jumpPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
    setJumpPage("");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const renderSortArrow = (field) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? "▲" : "▼";
  };

  return (
    <Container>
      <Title>Applications</Title>

      <ControlsRow>
        <SearchInput
          type="text"
          placeholder="Search by company or role..."
          aria-label="Search applications"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          aria-label="Select items per page"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((val) => (
            <option key={val} value={val}>
              {val} / page
            </option>
          ))}
        </Select>

        <JumpInput
          type="text"
          placeholder="Jump to"
          aria-label="Jump to page number"
          maxLength={String(totalPages).length}
          value={jumpPage}
          onChange={handleJumpPageChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleJumpPageSubmit();
            }
          }}
        />

        <Button onClick={handleJumpPageSubmit} disabled={!jumpPage}>
          Go
        </Button>
      </ControlsRow>

      <Table role="table" aria-label="Applications list">
        <Thead>
          <Tr even>
            <Th
              tabIndex={0}
              role="columnheader"
              aria-sort={sortField === "company" ? sortDir : "none"}
              onClick={() => handleSort("company")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSort("company");
              }}
            >
              Company {renderSortArrow("company") && <SortArrow>{renderSortArrow("company")}</SortArrow>}
            </Th>
            <Th
              tabIndex={0}
              role="columnheader"
              aria-sort={sortField === "roleTitle" ? sortDir : "none"}
              onClick={() => handleSort("roleTitle")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSort("roleTitle");
              }}
            >
              Role {renderSortArrow("roleTitle") && <SortArrow>{renderSortArrow("roleTitle")}</SortArrow>}
            </Th>
            <Th
              tabIndex={0}
              role="columnheader"
              aria-sort={sortField === "status" ? sortDir : "none"}
              onClick={() => handleSort("status")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSort("status");
              }}
            >
              Status {renderSortArrow("status") && <SortArrow>{renderSortArrow("status")}</SortArrow>}
            </Th>
          </Tr>
        </Thead>

        <tbody>
          {loading ? (
            [...Array(limit)].map((_, index) => (
              <LoadingRow key={index}>
                <Td colSpan={3}>
                  <LoadingSkeleton />
                </Td>
              </LoadingRow>
            ))
          ) : applications.length === 0 ? (
            <LoadingRow>
              <Td colSpan={3} style={{ textAlign: "center", padding: "24px", fontStyle: "italic", color: "#666" }}>
                No applications found.
              </Td>
            </LoadingRow>
          ) : (
            applications.map((app, i) => (
              <Tr key={app._id} even={i % 2 === 0}>
                <Td>{app.company}</Td>
                <Td>{app.roleTitle}</Td>
                <Td>
                  <StatusTag status={app.status}>{app.status}</StatusTag>
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>

      <Pagination>
        <Button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1 || loading}
          aria-label="Previous page"
        >
          &laquo; Prev
        </Button>

        <PageInfo>
          Page {currentPage} of {totalPages}
        </PageInfo>

        <Button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          aria-label="Next page"
        >
          Next &raquo;
        </Button>
      </Pagination>
    </Container>
  );
};

export default ApplicationList;
