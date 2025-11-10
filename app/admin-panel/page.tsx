"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface AdminUser {
  id: number;
  username: string;
  department: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  department: string;
  created_at: string;
}

interface FormFile {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  description: string;
  department: string;
  upload_date: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Accordion state
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    news: false,
    forms: false,
    visa: false,
    registerAdmin: false,
    registerAdminForm: false,
    visaUpdate: false,
    visaTasks: false
  });
  
  // News management
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsMessage, setNewsMessage] = useState("");
  
  // File management
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filesList, setFilesList] = useState<FormFile[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFileReading, setIsFileReading] = useState(false);
  
  // Provide a ref for the hidden file input (fixes diagnostics)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visa management (only for visa department)
  const [schoolId, setSchoolId] = useState("");
  const [personType, setPersonType] = useState("");
  const [stage, setStage] = useState("");
  const [visaMessage, setVisaMessage] = useState("");
  const [currentVisaTasks, setCurrentVisaTasks] = useState<{[key: number]: any[]}>({});
  const [selectedSchoolForTasks, setSelectedSchoolForTasks] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
const [showVisaTasks, setShowVisaTasks] = useState(false);
const [showAddNewSchoolIdSection, setShowAddNewSchoolIdSection] = useState(false);

  // Register Admin management (only for superadmin)
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminDepartment, setNewAdminDepartment] = useState("");
  const [registerAdminMessage, setRegisterAdminMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user is logged in
    const storedUser = localStorage.getItem("admin_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setAdminUser(user);
      fetchNews(user.department);
      fetchFiles(user.department);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, mounted]);

  const fetchNews = async (department: string) => {
    try {
      const response = await fetch(`/api/admin/news?department=${department}`);
      const data = await response.json();
      if (data.success) {
        setNewsList(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const fetchFiles = async (department: string) => {
    try {
      console.log("Fetching files for department:", department);
      const response = await fetch(`/api/admin/files?department=${department}`);
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      if (data.success) {
        setFilesList(data.files);
        console.log("Files loaded:", data.files.length);
        // Debug: Log each file's name with detailed information
        data.files.forEach((file: FormFile, index: number) => {
          console.log(`File ${index + 1}:`, {
            id: file.id,
            title: file.title,
            file_name: file.file_name,
            file_type: file.file_type,
            department: file.department,
            upload_date: file.upload_date,
            download_url: `/uploads/${file.file_name}`,
            absolute_url: `${window.location.origin}/uploads/${file.file_name}`
          });
        });
      } else {
        console.error("API returned error:", data.error);
        setManageMessage(`Error loading files: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setManageMessage("Failed to connect to database. Please check your connection.");
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      setNewsMessage("Please fill in both title and content.");
      return;
    }

    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle,
          content: newsContent,
          department: adminUser?.department,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewsMessage("News announcement added successfully!");
        setNewsTitle("");
        setNewsContent("");
        fetchNews(adminUser?.department || "");
      } else {
        setNewsMessage(data.error || "Failed to add news");
      }
    } catch (error) {
      setNewsMessage("Network error. Please try again.");
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const response = await fetch("/api/admin/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, department: adminUser?.department }),
      });

      const data = await response.json();
      if (data.success) {
        setNewsMessage("News announcement deleted successfully!");
        fetchNews(adminUser?.department || "");
      } else {
        setNewsMessage(data.error || "Failed to delete news");
      }
    } catch (error) {
      setNewsMessage("Network error. Please try again.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Start file reading loading
    setIsFileReading(true);
    setUploadMessage("Reading file...");

    // Simulate file reading process with a small delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Clear any previous messages
    setUploadMessage("");

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadMessage("Please select a valid file type (PDF, DOC, DOCX).");
      setSelectedFile(null);
      setIsFileReading(false);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadMessage("File size must be less than 10MB.");
      setSelectedFile(null);
      setIsFileReading(false);
      return;
    }

    setSelectedFile(file);
    setUploadMessage(`File ready: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    setIsFileReading(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileTitle.trim()) {
      setUploadMessage("Please select a file and enter a title.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", fileTitle);
    formData.append("description", fileDescription);
    formData.append("department", adminUser?.department || "");

    try {
      const response = await fetch("/api/admin/files", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadMessage("File uploaded successfully!");
        setFileTitle("");
        setFileDescription("");
        setSelectedFile(null);
        fetchFiles(adminUser?.department || "");
      } else {
        setUploadMessage(data.error || "Failed to upload file");
      }
    } catch (error) {
      setUploadMessage("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, department: adminUser?.department }),
      });

      const data = await response.json();
      if (data.success) {
        setManageMessage("File deleted successfully!");
        fetchFiles(adminUser?.department || "");
      } else {
        setManageMessage(data.error || "Failed to delete file");
      }
    } catch (error) {
      setManageMessage("Network error. Please try again.");
    }
  };

  const handleVisaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser?.department.toLowerCase() !== "visa") {
      setVisaMessage("Access denied. Only Visa department admins can update.");
      return;
    }

    if (!schoolId.trim()) {
      setVisaMessage("Please enter a school ID.");
      return;
    }

    try {
      const requestBody: any = {
        schoolId: schoolId.trim(),
        department: adminUser?.department,
      };

      // For new records, require person type and auto-assign stage
      if (Object.keys(currentVisaTasks).length === 0) {
        if (!personType) {
          setVisaMessage("Please select a person type");
          return;
        }
        requestBody.personType = personType;
        requestBody.stage = personType === 'parent' ? 1 : 3; // Auto-assign stage based on person type
      } else {
        // For existing records, use the selected stage
        if (!stage) {
          setVisaMessage("Please select a stage");
          return;
        }
        requestBody.stage = parseInt(stage);
      }

      const response = await fetch("/api/admin/visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        const isExistingRecord = Object.keys(currentVisaTasks).length > 0;
        // Keep the ID for the tasks header and actions
        setSelectedSchoolForTasks(requestBody.schoolId);

        setSchoolId("");
        setPersonType("");
        setStage("");
        // Refresh the status after successful submission and validate existence
        await fetchVisaTasks(requestBody.schoolId);

        // Check if tasks exist after fetch to confirm ID was added
        const tasksExistAfterFetch = Object.keys(currentVisaTasks).length > 0;
        const successMessage = isExistingRecord 
          ? "Visa record updated successfully!" 
          : tasksExistAfterFetch ? "School ID added successfully!" : "Failed to find or add school ID.";
        setVisaMessage(successMessage);
      } else {
        setVisaMessage(data.error || "Failed to update visa status");
      }
    } catch (error) {
      setVisaMessage("Network error. Please try again.");
    }
  };

  const fetchVisaTasks = async (schoolId: string) => {
    if (!schoolId.trim()) {
      setTaskMessage("Please enter a school ID.");
      return;
    }

    try {
      const response = await fetch(`/api/visa-status?school_id=${encodeURIComponent(schoolId.trim())}`);
      const data = await response.json();
      
      if (response.ok && data.tasks) {
        setCurrentVisaTasks(data.tasks);
        setTaskMessage("");
        setShowAddNewSchoolIdSection(false); // Tasks found, hide add new section
      } else {
        setCurrentVisaTasks({});
        setTaskMessage(data.error || "No tasks found for this school ID");
        setShowAddNewSchoolIdSection(true); // No tasks found, show add new section
      }
    } catch (error) {
      setCurrentVisaTasks({});
      setTaskMessage("Network error. Please try again.");
      setShowAddNewSchoolIdSection(false); // Network error, hide add new section
    }
  };

  const handleTaskToggle = async (stage: number, taskIndex: number, isCompleted: boolean) => {
    if (!selectedSchoolForTasks.trim()) {
      setTaskMessage("Please select a school ID first.");
      return;
    }

    try {
      const response = await fetch("/api/admin/visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            schoolId: selectedSchoolForTasks.trim(),
            personType: "student", // Default for task updates
            stage: stage,
            department: adminUser?.department,
            tasks: [{
              stage: stage,
              taskIndex: taskIndex,
              isCompleted: isCompleted
            }]
          }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh tasks
        await fetchVisaTasks(selectedSchoolForTasks);
        setTaskMessage("Task updated successfully!");
      } else {
        setTaskMessage(data.error || "Failed to update task");
      }
    } catch (error) {
      setTaskMessage("Network error. Please try again.");
    }
  };

  const handleCheckAllTasks = async (stage: number, checkAll: boolean) => {
    if (!selectedSchoolForTasks.trim()) {
      setTaskMessage("Please select a school ID first.");
      return;
    }

    if (!currentVisaTasks[stage] || currentVisaTasks[stage].length === 0) {
      setTaskMessage("No tasks available for this stage.");
      return;
    }

    try {
      const tasksToUpdate = currentVisaTasks[stage].map((task: any) => ({
        stage: stage,
        taskIndex: task.taskIndex,
        isCompleted: checkAll
      }));

      const response = await fetch("/api/admin/visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: selectedSchoolForTasks.trim(),
          personType: "student", // Default for task updates
          stage: stage,
          department: adminUser?.department,
          tasks: tasksToUpdate
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh tasks
        await fetchVisaTasks(selectedSchoolForTasks);
        setTaskMessage(`All tasks ${checkAll ? 'checked' : 'unchecked'} successfully!`);
      } else {
        setTaskMessage(data.error || "Failed to update tasks");
      }
    } catch (error) {
      setTaskMessage("Network error. Please try again.");
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser?.department.toLowerCase() !== "superadmin") {
      setRegisterAdminMessage("Access denied. Only Super Admins can register new admins.");
      return;
    }

    if (!newAdminUsername.trim() || !newAdminPassword.trim() || !newAdminDepartment) {
      setRegisterAdminMessage("Please fill in all fields.");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newAdminUsername.trim(),
          password: newAdminPassword.trim(),
          department: newAdminDepartment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRegisterAdminMessage("Admin registered successfully!");
        setNewAdminUsername("");
        setNewAdminPassword("");
        setNewAdminDepartment("");
      } else {
        setRegisterAdminMessage(data.error || "Failed to register admin");
      }
    } catch (error) {
      setRegisterAdminMessage("Network error. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/");
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading || !mounted) {
    return (
      <Layout>
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </Layout>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <Layout>
      <div className="admin-panel">
        {/* 2. User Log and Logout */}
        <div className="user-info-section">
          <div className="user-info-container">
            <div className="user-details">
              <div className="admin-name">{adminUser.username}</div>
              <div className="admin-dept">{adminUser.department} Department</div>
            </div>
            <div className="user-actions">
              {adminUser.department.toLowerCase() === "superadmin" && (
                <button 
                  onClick={() => router.push('/register-admin')} 
                  className="register-admin-btn"
                >
                  <i className="fas fa-user-plus"></i>
                  Register Admin
                </button>
              )}
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* 3. Page Title */}
        <div className="page-title">
          <h2>Administrative Dashboard</h2>
          <p>Manage forms and documents for the {adminUser.department} department</p>
        </div>

        {/* 4. Page Content */}
        <div className="container">
          {/* News & Announcements Section */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('news')}>
              <div className="accordion-title">
                <i className="fas fa-newspaper"></i>
                News & Announcements
              </div>
              <i className={`fas fa-chevron-down accordion-arrow ${expandedSections.news ? 'expanded' : ''}`}></i>
            </div>
            {expandedSections.news && (
              <div className="accordion-content">
                <div className="accordion-subsection">
                  <div className="subsection-header" onClick={() => toggleSection('newsManage')}>
                    <div className="subsection-title">
                      <i className="fas fa-newspaper"></i>
                      News & Announcements
                    </div>
                    <i className={`fas fa-chevron-down subsection-arrow ${expandedSections.newsManage ? 'expanded' : ''}`}></i>
                  </div>
                  {expandedSections.newsManage && (
                    <div className="subsection-content">
                      {newsMessage && (
                        <div className={`message ${newsMessage.includes("successfully") ? "success" : "error"}`}>
                          {newsMessage}
                        </div>
                      )}
                      
                      <form onSubmit={handleAddNews} className="admin-form">
                        <div className="form-group">
                          <label htmlFor="newsTitle">News Title</label>
                          <input
                            type="text"
                            id="newsTitle"
                            value={newsTitle}
                            onChange={(e) => setNewsTitle(e.target.value)}
                            placeholder="Enter news title"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="newsContent">News Content</label>
                          <textarea
                            id="newsContent"
                            value={newsContent}
                            onChange={(e) => setNewsContent(e.target.value)}
                            placeholder="Enter news content"
                            rows={4}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-plus"></i>
                          Add News
                        </button>
                      </form>

                      {/* News List */}
                      <div className="news-list">
                        <h3>Current News ({adminUser.department} Department)</h3>
                        {newsList.length === 0 ? (
                          <p className="no-items">No news announcements yet.</p>
                        ) : (
                          newsList.map((news) => (
                            <div key={news.id} className="news-item">
                              <div className="news-content">
                                <h4>{news.title}</h4>
                                <p>{news.content}</p>
                                <small>Created: {new Date(news.created_at).toLocaleDateString()}</small>
                              </div>
                              <button
                                onClick={() => handleDeleteNews(news.id)}
                                className="btn btn-danger btn-sm"
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Forms Management Section */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('forms')}>
              <div className="accordion-title">
                <i className="fas fa-folder"></i>
                Forms Management
              </div>
              <i className={`fas fa-chevron-down accordion-arrow ${expandedSections.forms ? 'expanded' : ''}`}></i>
            </div>
            {expandedSections.forms && (
              <div className="accordion-content">
                <div className="accordion-subsection">
                  <div className="subsection-header" onClick={() => toggleSection('uploadForm')}>
                    <div className="subsection-title">
                      <i className="fas fa-cloud-upload-alt"></i>
                      Upload New Form
                    </div>
                    <i className={`fas fa-chevron-down subsection-arrow ${expandedSections.uploadForm ? 'expanded' : ''}`}></i>
                  </div>
                  {expandedSections.uploadForm && (
                    <div className="subsection-content">
                      {/* Upload messages only */}
                      {uploadMessage && (
                        <div className={`message ${
                          uploadMessage.includes("successfully") ? "success" : 
                          uploadMessage.includes("File ready:") ? "info" : 
                          "error"
                        }`}>
                          {uploadMessage}
                        </div>
                      )}
                      
                      <form onSubmit={handleFileUpload} className="admin-form">
                        <div className="form-group">
                          <label htmlFor="fileTitle">File Title</label>
                          <input
                            type="text"
                            id="fileTitle"
                            value={fileTitle}
                            onChange={(e) => setFileTitle(e.target.value)}
                            placeholder="Enter file title"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="fileDescription">Description</label>
                          <textarea
                            id="fileDescription"
                            value={fileDescription}
                            onChange={(e) => setFileDescription(e.target.value)}
                            placeholder="Enter file description"
                            rows={3}
                          />
                        </div>
                        {/* Select File (hidden input only) */}
                        <div className="form-group">
                          <label htmlFor="file">Select File (PDF, DOC, DOCX)</label>
                          <input
                            type="file"
                            id="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            required
                            className="file-input-hidden"
                            ref={fileInputRef}
                          />
                        </div>
                        
                        {/* Choose File button now opens file picker */}
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading || isFileReading}
                        >
                          {isFileReading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Reading File...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-folder-open"></i>
                              Choose File
                            </>
                          )}
                        </button>
                        
                        {/* Upload File button submits the form */}
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={isUploading || isFileReading || !selectedFile}
                        >
                          {isUploading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-upload"></i>
                              Upload File
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                <div className="accordion-subsection">
                  <div className="subsection-header" onClick={() => toggleSection('manageForms')}>
                    <div className="subsection-title">
                      <i className="fas fa-folder-open"></i>
                      Manage Forms
                    </div>
                    <i className={`fas fa-chevron-down subsection-arrow ${expandedSections.manageForms ? 'expanded' : ''}`}></i>
                  </div>
                  {expandedSections.manageForms && (
                    <div className="subsection-content">
                      {/* Manage messages only */}
                      {manageMessage && (
                        <div className={`alert ${manageMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                          {manageMessage}
                        </div>
                      )}
                      
                      {/* Files List */}
                      <div className="files-list">
                        <h3>Uploaded Files ({adminUser.department} Department)</h3>
                        {filesList.length === 0 ? (
                          <p className="no-items">No files uploaded yet.</p>
                        ) : (
                          filesList.map((file) => (
                            <div key={file.id} className="file-item">
                              <div className="file-content">
                                <h4>{file.title}</h4>
                                <p>{file.description}</p>
                                <div className="file-meta">
                                  <span className="file-type">{file.file_type.toUpperCase()}</span>
                                  <span className="file-date">
                                    Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="file-actions">
                                <a
                                  href={`/uploads/${file.file_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  onClick={(e) => {
                                    console.log("Download clicked for file:", file.file_name);
                                    console.log("Full URL:", `/uploads/${file.file_name}`);
                                    console.log("Absolute URL:", `${window.location.origin}/uploads/${file.file_name}`);
                                  }}
                                >
                                  <i className="fas fa-download"></i> Download
                                </a>
                                <a
                                  href={`/uploads/${file.file_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary btn-sm"
                                  onClick={(e) => {
                                    console.log("View clicked for file:", file.file_name);
                                  }}
                                >
                                  <i className="fas fa-eye"></i> View
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="btn btn-danger btn-sm"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>




          {/* Visa Management Section (Only for Visa Department) */}
          {adminUser.department.toLowerCase() === "visa" && (
            <div className="accordion-section">
              <div className="accordion-header" onClick={() => toggleSection('visa')}>
                <div className="accordion-title">
                  <i className="fas fa-passport"></i>
                  Visa Management
                </div>
                <i className={`fas fa-chevron-down accordion-arrow ${expandedSections.visa ? 'expanded' : ''}`}></i>
              </div>
              {expandedSections.visa && (
                <div className="accordion-content">
                  {/* Combined Visa Management */}
                  <div className="visa-management-container">
                    {(visaMessage || taskMessage) && (
                      <div className={`message ${(visaMessage?.includes("successfully") || taskMessage?.includes("successfully")) ? "success" : "error"}`}>
                        <i className={`fas ${(visaMessage?.includes("successfully") || taskMessage?.includes("successfully")) ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {visaMessage || taskMessage}
                      </div>
                    )}
                    
                    {/* School ID Lookup Section */}
                    <div className="school-lookup-section">
                      <div className="form-group">
                        <label htmlFor="schoolId">
                          <i className="fas fa-search"></i> School ID Lookup
                        </label>
                        <div> {/* This div should wrap the input and button */}
                          <input
                            type="text"
                            id="schoolId"
                            value={schoolId}
                            onChange={(e) => {
                              setSchoolId(e.target.value);
                              setSelectedSchoolForTasks(e.target.value);
                              // Clear old task data when typing new ID
                              setCurrentVisaTasks({});
                              setVisaMessage(''); // Clear any previous visa messages
                              setTaskMessage(''); // Clear any previous task messages
                             setShowAddNewSchoolIdSection(false); // Hide add section when typing new ID
                           }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent default form submission
                                fetchVisaTasks(schoolId);
                              }
                            }}
                             placeholder="Enter school ID (e.g. S12345)"
                             required
                          />
                          <button
                            type="button" // Ensure this is 'button'
                            className="btn btn-secondary"
                            onClick={() => fetchVisaTasks(schoolId)} // Ensure this onClick is present
                            disabled={!schoolId.trim()}
                          >
                            <i className="fas fa-search"></i>
                            Check Status
                          </button>
                        </div>
                      </div>

                      {/* Status Display */}
                      {schoolId.trim() && Object.keys(currentVisaTasks).length > 0 && (
                        <div className="current-status-display">
                          <div className="status-header">
                            <i className="fas fa-info-circle"></i>
                            <span>Current Status for {schoolId}</span>
                          </div>
                          <div className="status-content">
                            <div className="status-item">
                              <span className="status-label">Existing Record:</span>
                              <span className="status-value found">
                                <i className="fas fa-check-circle"></i> Found
                              </span>
                            </div>

                            <div className="status-item">
                              <span className="status-label">Action Available:</span>
                              <button
                                type="button"
                                className="status-value update"
                                onClick={() => setShowVisaTasks(!showVisaTasks)}
                              >
                                <i className="fas fa-edit"></i> Update Record
                              </button>
                            </div>
                          </div>
                        </div>
                      )}


                    </div>



                    {/* Visa Status Update Form */}
                    <form onSubmit={handleVisaUpdate} className="admin-form">
                      {/* Keep add controls for new records */}
                      {showAddNewSchoolIdSection && ( // <--- CHANGE THIS LINE
                       <div className="visa-record-details-section">
                         <h4><i className="fas fa-user"></i> Add New School ID</h4>
                         <div className="form-group">
                            <label htmlFor="personType">Person Type</label>
                            <select
                              id="personType"
                              value={personType}
                              onChange={(e) => {
                                setPersonType(e.target.value);
                              }}
                            >
                              <option value="">Select person type</option>
                              <option value="parent">Parent</option>
                              <option value="student">Student</option>
                            </select>
                          </div>
                        </div>
                      )}
                      
                      {showAddNewSchoolIdSection && (
                        <div className="form-group">
                          <button type="submit" className="btn btn-primary" disabled={!schoolId.trim() || !personType}>
                            <i className="fas fa-check-circle"></i>
                            Confirm Add
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Task Management */}
                    {showVisaTasks && Object.keys(currentVisaTasks).length > 0 && (
                      <div className="visa-tasks-container">
                        <h4><i className="fas fa-tasks"></i> Visa Process Tasks for {selectedSchoolForTasks || schoolId}</h4>
                        {[1, 2, 3, 4].map(stage => (
                          <div key={stage} className="phase-tasks">
                            <div className="phase-header">
                              <h5>{`Stage ${stage}`}</h5>
                              {currentVisaTasks[stage] && currentVisaTasks[stage].length > 0 && (
                                <div className="check-all-buttons">
                                  <button
                                    type="button"
                                    className="check-all-btn check-btn"
                                    onClick={() => handleCheckAllTasks(stage, true)}
                                    title="Check all tasks in this stage"
                                  >
                                    <i className="fas fa-check-double"></i> Check All
                                  </button>
                                  <button
                                    type="button"
                                    className="check-all-btn uncheck-btn"
                                    onClick={() => handleCheckAllTasks(stage, false)}
                                    title="Uncheck all tasks in this stage"
                                  >
                                    <i className="fas fa-times"></i> Uncheck All
                                  </button>
                                </div>
                              )}
                            </div>

                            {currentVisaTasks[stage] && currentVisaTasks[stage].length > 0 ? (
                              <div className="tasks-list">
                                {currentVisaTasks[stage].map((task: any, index: number) => (
                                  <div key={index} className="task-item">
                                    <div className="task-left">
                                      <label className="task-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={task.isCompleted}
                                          onChange={(e) => handleTaskToggle(stage, task.taskIndex, e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className={`task-text ${task.isCompleted ? 'completed' : ''}`}>
                                          {task.description}
                                        </span>
                                      </label>
                                    </div>
                                    {task.completedAt && (
                                      <small className="completion-date">
                                        Completed: {new Date(task.completedAt).toLocaleDateString()}
                                      </small>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="no-tasks">No tasks available for this stage</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}