"use client";
import { useState, useEffect, FormEvent } from "react";
import Layout from "@/components/Layout";

interface FormFile {
  id: number;
  title: string;
  description: string;
  file_name: string;
  department: string;
  upload_date: string;
  file_size: number;
}

interface VisaStatus {
  school_id: string;
  person_type: string;
  stage: number;
  updated_at: string;
  tasks?: { [key: number]: any[] };
}

export default function VisaPage() {
  const [files, setFiles] = useState<FormFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredFiles, setFilteredFiles] = useState<FormFile[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [visaStatus, setVisaStatus] = useState<VisaStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter(file =>
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  // Auto-refresh visa status every 5 seconds when status is loaded
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (visaStatus && schoolId.trim()) {
      intervalId = setInterval(() => {
        fetchVisaStatusSilently(schoolId.trim());
      }, 5000); // 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [visaStatus, schoolId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/forms?department=visa');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Silent fetch for auto-refresh (doesn't show loading state)
  const fetchVisaStatusSilently = async (id: string) => {
    try {
      const response = await fetch(`/api/visa-status?school_id=${encodeURIComponent(id)}`);

      if (response.ok) {
        const data = await response.json();
        setVisaStatus(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setStatusError("");
      }
    } catch (error) {
      console.error('Error auto-refreshing visa status:', error);
      // Don't show error for silent refresh failures
    }
  };

  const checkVisaStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!schoolId.trim()) return;

    setStatusLoading(true);
    setStatusError("");
    setVisaStatus(null);

    try {
      // Fetch from actual API using school_id
      const response = await fetch(`/api/visa-status?school_id=${encodeURIComponent(schoolId)}`);

      if (response.ok) {
        const data = await response.json();
        setVisaStatus(data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else if (response.status === 404) {
        setStatusError("No record found for this School ID.");
      } else {
        // Handle other API errors properly
        const errorData = await response.json().catch(() => ({}));
        setStatusError(errorData.error || "Failed to fetch visa status. Please try again.");
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error);
      setStatusError("Network error. Please check your connection and try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (phase: number, tasks?: { [key: number]: any[] }) => {
    if (!tasks) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    // Count all tasks across all phases
    for (let phaseNum = 1; phaseNum <= 4; phaseNum++) {
      if (tasks[phaseNum]) {
        totalTasks += tasks[phaseNum].length;
        completedTasks += tasks[phaseNum].filter((task: any) => task.isCompleted).length;
      }
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getStageTitle = (stage: number) => {
    const titles = {
      1: "Application Submitted",
      2: "Document Review",
      3: "Processing",
      4: "Visa Ready"
    };
    return titles[stage as keyof typeof titles] || `Stage ${stage}`;
  };

  const getStageDescription = (stage: number) => {
    const descriptions = {
      1: "Your visa application has been received and is in the queue for processing.",
      2: "Our team is reviewing your submitted documents and verifying information.",
      3: "Your application is being processed by the relevant authorities.",
      4: "Your visa is ready for collection or has been dispatched."
    };
    return descriptions[stage as keyof typeof descriptions] || `Stage ${stage} description`;
  };

  // Helper: get tasks for a given stage
  const getTasksForStage = (stage: number, tasks?: { [key: number]: any[] }) => {
    return tasks && tasks[stage] ? tasks[stage] : [];
  };

  // Per-stage completion helpers
  const getStageStats = (stage: number, tasks?: { [key: number]: any[] }) => {
    const stageTasks = getTasksForStage(stage, tasks);
    const total = stageTasks.length;
    const completed = stageTasks.filter((t: any) => t.isCompleted).length;
    return { total, completed };
  };

  const isStageDone = (stage: number, tasks?: { [key: number]: any[] }) => {
    const { total, completed } = getStageStats(stage, tasks);
    return total > 0 && completed === total;
  };

  const isStageInProgress = (stage: number, tasks?: { [key: number]: any[] }) => {
    const { total, completed } = getStageStats(stage, tasks);
    return total > 0 && completed > 0 && completed < total;
  };

  const stageStatus = (stage: number, tasks?: { [key: number]: any[] }) => {
    if (isStageDone(stage, tasks)) return "done";
    if (isStageInProgress(stage, tasks)) return "in-progress";
    return "pending";
  };

  // Current stage = first stage that is NOT fully done
  const getCurrentStage = (tasks?: { [key: number]: any[] }) => {
    for (let stage = 1; stage <= 4; stage++) {
      if (!isStageDone(stage, tasks)) return stage;
    }
    return 4;
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #7c25af;
          --primary-light: #9c47d3;
          --primary-dark: #5c1b84;
          --accent: #f7b731;
          --bg: #f8f9fc;
          --white: #fff;
          --text: #2d3748;
          --text-light: #64748b;
          --shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          --shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }

        .container { max-width: 1200px; margin: 0 auto; padding: 60px 32px; transition: padding-left 0.3s ease; }

        .page-header { text-align: center; margin-bottom: 60px; }
        .page-header h1 { color: var(--primary-dark); font-size: 3rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -1px; }
        .page-header p { color: var(--text-light); font-size: 1.2rem; max-width: 600px; margin: 0 auto 32px; }

        /* Visa Status Section */
        .visa-section-new { background: var(--white); border-radius: 16px; padding: 32px; box-shadow: var(--shadow); margin-bottom: 32px; }
        .visa-section-new h2 { color: var(--primary); margin-bottom: 24px; font-size: 24px; font-weight: 600; }
        .visa-form-new { margin-bottom: 32px; }
        .form-group-new { display: flex; gap: 16px; align-items: end; flex-wrap: wrap; }
        .form-group-new label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text); font-size: 14px; }
        .visa-input-new { flex: 1; min-width: 200px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; color: #333; background-color: #fff; transition: all 0.3s ease; }
        .visa-input-new:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(124, 37, 175, 0.1); }
        .enter-btn-new { padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
        .enter-btn-new:hover { background: var(--primary-dark); transform: translateY(-2px); }
        .enter-btn-new:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .update-error { color: #e53e3e; margin-top: 8px; }

        .visa-progress-container-new { margin-top: 32px; }
        .visa-info-new { background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary); margin-bottom: 24px; }
        .visa-info-new p { margin-bottom: 8px; color: var(--text); }
        .visa-info-new p:last-child { margin-bottom: 0; }

        .progress-bar-container-new { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .progress-bar-new { flex: 1; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); }
        .progress-fill-new { height: 100%; background: linear-gradient(90deg, #7c25af 0%, #a855f7 100%); border-radius: 10px; transition: width 0.8s ease; position: relative; }
        .progress-fill-new::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%); animation: shimmer 2s infinite; }
        .progress-text-new { font-size: 18px; font-weight: bold; color: #7c25af; min-width: 50px; text-align: right; }

        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .progress-stages-new { display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px; }
        .stage-row-new { display: flex; align-items: center; gap: 24px; padding: 20px; border-radius: 12px; background: #ffffff; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
        .stage-box-container-new { display: flex; align-items: center; gap: 16px; min-width: 120px; margin-left: 20px; }
        .stage-box-new { width: 90px; height: 90px; border: 3px solid #cbd5e0; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #f7fafc; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .stage-box-new.pending { border-color: #cbd5e0 !important; background: #f7fafc !important; color: #4a5568 !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important; }
        .stage-box-new.completed { border-color: #7c25af; background: #7c25af; color: white; box-shadow: 0 4px 12px rgba(124, 37, 175, 0.3); }
        .stage-box-new.current { border-color: #7c25af; background: #7c25af; color: white; animation: pulse 2s infinite; box-shadow: 0 4px 12px rgba(124, 37, 175, 0.4); }
        .stage-number-new { font-size: 60px; font-weight: 900; font-family: 'Arial Black', 'Helvetica', sans-serif; line-height: 1; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }
        .progress-arrow-new { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .arrow-pointer-new { font-size: 24px; color: var(--accent); font-weight: bold; }
        .progress-percentage-new { font-size: 14px; font-weight: 600; color: var(--primary); background: white; padding: 4px 8px; border-radius: 12px; border: 2px solid var(--primary); }
        .stage-description-new { flex: 1; }
        .stage-description-new h4 { color: #1a202c; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .stage-description-new p { color: #4a5568; font-size: 16px; line-height: 1.6; font-weight: 500; }

        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        @media (max-width: 768px) {
          .form-group-new { flex-direction: column; align-items: stretch; }
          .stage-row-new { flex-direction: column; text-align: center; gap: 16px; }
          .stage-box-container-new { justify-content: center; }
        }

        /* Search & Files UI */
        .search-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; gap: 20px; flex-wrap: wrap; }
        .search-wrap { display: flex; align-items: center; background: var(--white); padding: 12px 20px; border-radius: 50px; box-shadow: var(--shadow); max-width: 400px; flex: 1; min-width: 280px; }
        .search-wrap input { border: 0; outline: none; padding: 8px 12px; width: 100%; font-size: 1rem; color: var(--text); background: transparent; }
        .search-wrap svg { margin-right: 8px; opacity: 0.6; }
        .view-toggle { display: flex; gap: 8px; background: var(--white); padding: 8px; border-radius: 12px; box-shadow: var(--shadow); }
        .view-btn { background: transparent; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-light); transition: all 0.3s ease; font-size: 0.9rem; }
        .view-btn.active { background: var(--primary); color: var(--white); box-shadow: 0 4px 12px rgba(124, 37, 175, 0.3); }
        .view-btn:hover:not(.active) { background: rgba(124, 37, 175, 0.1); color: var(--primary); }

        .files-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; margin-bottom: 40px; }
        .files-list { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
        .file-card { background: var(--white); border-radius: 20px; box-shadow: var(--shadow); padding: 32px; transition: all 0.3s ease; position: relative; overflow: hidden; border: 1px solid rgba(124, 37, 175, 0.1); }
        .file-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-hover); border-color: rgba(124, 37, 175, 0.2); }
        .file-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; }
        .dept-badge { font-size: 0.85rem; color: var(--primary); font-weight: 600; background: rgba(124, 37, 175, 0.1); padding: 8px 16px; border-radius: 20px; }
        .file-date { color: var(--text-light); font-size: 0.9rem; font-weight: 500; }
        .file-card h3 { font-size: 1.3rem; color: var(--text); margin-bottom: 12px; }
      `}</style>

      <Layout>
        <div className="container">
          <div className="page-header">
            <h1>Visa Department</h1>
            <p>Official visa forms & documents — latest first.</p>
          </div>

          <div className="visa-section-new">
            <h2>Check Visa Status</h2>
            <form className="visa-form-new" onSubmit={checkVisaStatus}>
              <div className="form-group-new">
                <div style={{ flex: 1, minWidth: 280 }}>
                  <label htmlFor="schoolId">School ID</label>
                  <input
                    id="schoolId"
                    className="visa-input-new"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="Enter your School ID"
                  />
                </div>
                <button type="submit" className="enter-btn-new" disabled={statusLoading || !schoolId.trim()}>
                  {statusLoading ? "Checking..." : "Check Status"}
                </button>
              </div>
              {statusError && <p className="update-error">{statusError}</p>}
            </form>

            {visaStatus && (
              <div className="visa-progress-container-new">
                <div className="visa-info-new">
                  <p><strong>School ID:</strong> {visaStatus.school_id}</p>
                  <p><strong>Person Type:</strong> {visaStatus.person_type}</p>
                  <p><strong>Last Updated:</strong> {visaStatus.updated_at}</p>
                  <p><strong>Auto-refresh:</strong> {lastUpdated ? `Last checked at ${lastUpdated}` : "Waiting..."}</p>
                </div>

                <div className="progress-bar-container-new">
                  <div className="progress-bar-new">
                    <div
                      className="progress-fill-new"
                      style={{ width: `${getProgressPercentage(visaStatus.stage, visaStatus.tasks)}%` }}
                    />
                  </div>
                  <div className="progress-text-new">{getProgressPercentage(visaStatus.stage, visaStatus.tasks)}%</div>
                </div>

                <div className="progress-stages-new">
                  {[1, 2, 3, 4].map((st) => {
                    const status = stageStatus(st, visaStatus.tasks);
                    const isCurrent = st === getCurrentStage(visaStatus.tasks);
                    const boxClass =
                      status === "done"
                        ? "stage-box-new completed"
                        : isCurrent
                        ? "stage-box-new current"
                        : "stage-box-new pending";
                    const stageTasks = getTasksForStage(st, visaStatus.tasks);

                    return (
                      <div key={st} className="stage-row-new">
                        <div className="stage-box-container-new">
                          <div className={boxClass}>
                            <span className="stage-number-new">{st}</span>
                          </div>
                          <div className="progress-arrow-new">
                            <span className="arrow-pointer-new">→</span>
                            <span className="progress-percentage-new">
                              {status === "done"
                                ? "Done"
                                : status === "in-progress"
                                ? "In Progress"
                                : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="stage-description-new">
                          <h4>{getStageTitle(st)}</h4>
                          <p>{getStageDescription(st)}</p>

                          {stageTasks.length > 0 && (
                            <div className="task-list-new">
                              {stageTasks.map((t: any, idx: number) => (
                                <div key={idx} className="task-item-new">
                                  <span className={`check-icon ${t.isCompleted ? "done" : "pending"}`}>
                                    {t.isCompleted ? "✓" : ""}
                                  </span>
                                  <span>{t.description}</span>
                                  {t.isCompleted && t.completedAt && (
                                    <span className="task-date">
                                      {new Date(t.completedAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="search-controls">
            <div className="search-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                type="button"
              >
                Grid
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                type="button"
              >
                List
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading files...</p>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="files-grid">
                  {filteredFiles.map(file => (
                    <div key={file.id} className="file-card">
                      <div className="file-meta">
                        <span className="dept-badge">{file.department}</span>
                        <span className="file-date">{formatDate(file.upload_date)}</span>
                      </div>
                      <h3>{file.title}</h3>
                      <p style={{ color: 'var(--text-light)', marginBottom: 12 }}>{file.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <span style={{ color: 'var(--text-light)' }}>{formatFileSize(file.file_size)}</span>
                        <a
                          href={`/files/${encodeURIComponent(file.file_name)}`}
                          download
                          style={{
                            padding: '10px 16px',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="files-list">
                  {filteredFiles.map(file => (
                    <div key={file.id} className="file-card">
                      <div className="file-meta">
                        <span className="dept-badge">{file.department}</span>
                        <span className="file-date">{formatDate(file.upload_date)}</span>
                      </div>
                      <h3>{file.title}</h3>
                      <p style={{ color: 'var(--text-light)', marginBottom: 12 }}>{file.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <span style={{ color: 'var(--text-light)' }}>{formatFileSize(file.file_size)}</span>
                        <a
                          href={`/files/${encodeURIComponent(file.file_name)}`}
                          download
                          style={{
                            padding: '10px 16px',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
