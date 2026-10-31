import React, { useState, useMemo } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Inbox,
  UploadCloud,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Paperclip,
  Eye,
  Download,
  Database,
  Cpu,
  Send,
  MessageSquare,
  History,
  Building,
  User,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  ArrowUpRight,
  Layers,
  ChevronRight,
  Bell,
  LogOut,
  SlidersHorizontal,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { requestsApi, submittalsApi, notificationsApi, filesApi } from './api/client';

export default function DesignTeamDashboard({
  requests = [],
  setRequests,
  designers = [],
  setDesigners,
  onLogout,
  loginEmail
}) {
  // Active Navigation Tab: 'Dashboard' | 'Requirements' | 'Upload Submittals' | 'Review Queue' | 'Drawing Vault' | 'Head Revisions'
  const [currentTab, setCurrentTab] = useState('Dashboard');

  // Selected Designer filter
  const [selectedDesignerName, setSelectedDesignerName] = useState('All Team');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [endDateFilter, setEndDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Modal & Popover States
  const [selectedReqForDetail, setSelectedReqForDetail] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('Requirements');
  const [submittalSubTab, setSubmittalSubTab] = useState('Revisions Needed');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReqForUpload, setSelectedReqForUpload] = useState(null);
  const [revisionModalReq, setRevisionModalReq] = useState(null);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);

  // Team Notifications state
  const [teamNotifications, setTeamNotifications] = useState([]);

  // Upload Form State & Notification Ref
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const fileInputRef = React.useRef(null);
  const modalFileInputRef = React.useRef(null);
  const notificationRef = React.useRef(null);

  // Click outside listener for Notification Popover
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationsPopover(false);
      }
    };
    if (showNotificationsPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsPopover]);

  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('AutoCAD');
  const [uploadDeliverableType, setUploadDeliverableType] = useState('2D Drawing');
  const [uploadVersion, setUploadVersion] = useState('v1.0');
  const [uploadFileSize, setUploadFileSize] = useState('14.2 MB');
  const [uploadNotes, setUploadNotes] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      setUploadFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadFileSize(sizeMb > 0 ? `${sizeMb} MB` : `${(file.size / 1024).toFixed(0)} KB`);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'dwg' || ext === 'dxf') setUploadFileType('AutoCAD');
      else if (ext === 'pdf') setUploadFileType('PDF');
      else if (ext === 'skp' || ext === 'fbx') setUploadFileType('3D Model');
      else if (ext === 'std') setUploadFileType('STAAD');
      else if (ext === 'zip' || ext === 'rar') setUploadFileType('ZIP Archive');
    }
  };
  const [uploadedFilesList, setUploadedFilesList] = useState([]);

  // Comment state inside Detail Modal
  const [newCommentText, setNewCommentText] = useState('');

  // Tesco ERM States & Integration Handlers
  const [ermSyncStatus, setErmSyncStatus] = useState('connected'); // 'connected' | 'syncing' | 'error'
  const [lastErmSync, setLastErmSync] = useState('2026-07-22 09:30 AM');
  const [ermSyncLogs, setErmSyncLogs] = useState([
    { id: 1, type: 'info', text: 'Tesco ERM sync pipeline listening on port 8443.', timestamp: '09:20:12' },
    { id: 2, type: 'success', text: 'Authentication successful with Tesco Enterprise Gateway.', timestamp: '09:20:13' },
    { id: 3, type: 'info', text: 'Pushed structural drawings manifest to ERM ERP Storage.', timestamp: '09:25:00' },
    { id: 4, type: 'success', text: 'Synced 3 active drawing metadata sets to Tesco ERM database.', timestamp: '09:30:00' }
  ]);
  const [ermInventory, setErmInventory] = useState([
    { id: 'INV-001', material: 'IS-2062 Grade Steel Plate', category: 'Plates & Sheets', stock: 120, allocated: 45, unit: 'Tons', warningLevel: 30 },
    { id: 'INV-002', material: 'High Tensile PEB Columns (HTS)', category: 'PEB Structures', stock: 85, allocated: 30, unit: 'Pcs', warningLevel: 20 },
    { id: 'INV-003', material: 'Cold Rolled Purlins (Z & C Sections)', category: 'Structural Purlins', stock: 450, allocated: 180, unit: 'Meters', warningLevel: 100 },
    { id: 'INV-004', material: 'M24 High Strength Friction Grip Bolts', category: 'Fasteners', stock: 2500, allocated: 800, unit: 'Units', warningLevel: 500 }
  ]);
  const [ermProjectMapping, setErmProjectMapping] = useState([
    { crmId: 'REQ-2026-001', name: 'PEB Warehouse Structure', ermId: 'TS-ERM-9403', type: 'Material & Capacity', status: 'Synced' },
    { crmId: 'REQ-2026-002', name: 'Residential Roof Structure', ermId: 'TS-ERM-8891', type: 'Material Billing', status: 'Synced' },
    { crmId: 'REQ-2026-003', name: 'Commercial Glass Canopy', ermId: 'TS-ERM-7622', type: 'Engineering Capacity', status: 'Pending Sync' }
  ]);
  
  const triggerErmSync = () => {
    setErmSyncStatus('syncing');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setErmSyncLogs(prev => [
      ...prev,
      { id: prev.length + 1, type: 'info', text: 'Starting manually triggered Tesco ERM full synchronization...', timestamp }
    ]);

    setTimeout(() => {
      const now = new Date();
      const formatTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const formatSyncDate = now.toISOString().split('T')[0] + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setLastErmSync(formatSyncDate);
      setErmSyncStatus('connected');
      
      setErmProjectMapping(prev => prev.map(m => ({ ...m, status: 'Synced' })));
      
      setErmSyncLogs(prev => [
        ...prev,
        { id: prev.length + 1, type: 'success', text: 'Tesco ERM Database: Successfully updated project models & design assets.', timestamp: formatTime }
      ]);
    }, 1500);
  };

  const handleUpdateAllocation = (invId, amount) => {
    setErmInventory(prev => prev.map(item => {
      if (item.id === invId) {
        const newAllocated = Math.max(0, Math.min(item.stock, item.allocated + amount));
        // Add console log
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setErmSyncLogs(l => [
          ...l,
          { id: l.length + 1, type: 'info', text: `Adjusted allocation of ${item.material} by ${amount > 0 ? '+' : ''}${amount} ${item.unit}. New allocation: ${newAllocated} ${item.unit}.`, timestamp }
        ]);
        return { ...item, allocated: newAllocated };
      }
      return item;
    }));
  };

  // Active Designer Profile object
  const activeDesigner = useMemo(() => {
    return designers.find(d => d.name === selectedDesignerName) || designers[0] || {
      name: 'Amit Patel',
      role: 'PEB Specialist',
      avatar: 'AP',
      status: 'Available'
    };
  }, [designers, selectedDesignerName]);

  // Filtered requests: Exclusively PEB project types for Design Team CRM
  const designerRequests = useMemo(() => {
    return requests.filter(r => {
      // Exclusively PEB projects for Design Team CRM
      const isPEB = r.projectType === 'PEB';

      // Show tasks assigned to selected designer, or unassigned tasks available for team
      const isAssignedToCurrent = selectedDesignerName === 'All Team' 
        ? true 
        : (r.assignedDesigner === selectedDesignerName || r.assignedDesigner === 'Unassigned');

      const matchesSearch = 
        r.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' ? true : r.priority === priorityFilter;

      const matchesDateRange = (!startDateFilter || r.dueDate >= startDateFilter) && (!endDateFilter || r.dueDate <= endDateFilter);

      return isPEB && isAssignedToCurrent && matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [requests, selectedDesignerName, searchTerm, statusFilter, priorityFilter, startDateFilter, endDateFilter]);

  // Summary Metrics for Design Team (PEB Projects Only)
  const metrics = useMemo(() => {
    const assigned = requests.filter(r => r.projectType === 'PEB' && (selectedDesignerName === 'All Team' ? true : r.assignedDesigner === selectedDesignerName));
    return {
      totalAssigned: assigned.length,
      inProgress: assigned.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length,
      pendingReview: assigned.filter(r => r.status === 'Pending Review' || r.status === 'Under Review').length,
      approved: assigned.filter(r => r.status === 'Approved' || r.status === 'Completed').length,
      revisionNeeded: assigned.filter(r => r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head')).length,
      urgentCount: assigned.filter(r => r.priority === 'Urgent').length
    };
  }, [requests, selectedDesignerName]);

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> In Production</span>;
      case 'Assigned':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#E0E7FF', color: '#3730A3', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Inbox size={12} /> Assigned from Head</span>;
      case 'Pending Review':
      case 'Under Review':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#92400E', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HourglassIcon /> Waiting for Head Review</span>;
      case 'Approved':
      case 'Completed':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Approved</span>;
      case 'Revision':
      case 'Revision Requested':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Revision Requested</span>;
      default:
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#F1F5F9', color: '#475569' }}>{status}</span>;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    const isUrgent = priority === 'Urgent';
    const isHigh = priority === 'High';
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: 700,
        backgroundColor: isUrgent ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#E2E8F0',
        color: isUrgent ? '#991B1B' : isHigh ? '#9A3412' : '#475569'
      }}>
        {priority}
      </span>
    );
  };

  // Handle Opening Upload Modal
  const handleOpenUpload = (req) => {
    setSelectedReqForUpload(req);
    setUploadFileName(`${req.projectName.replace(/\s+/g, '_')}_Layout_${uploadVersion}.dwg`);
    setUploadNotes(`Uploaded completed design drawing for ${req.projectName} (${req.requirement}) as per Design Head specifications.`);
    setUploadModalOpen(true);
  };

  // Handle Submitting Design File
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReqForUpload) return;
    try {
      let fileId = '';
      if (selectedFileObj) {
        const up = await filesApi.upload(selectedFileObj, { entity: 'submittal', entityId: selectedReqForUpload.id, uploadedBy: selectedDesignerName });
        fileId = up.fileId;
      }
      await submittalsApi.create({
        reqId: selectedReqForUpload.id, projectName: selectedReqForUpload.projectName,
        fileName: uploadFileName || `${selectedReqForUpload.projectName}_Design.dwg`,
        fileType: uploadFileType, fileSize: uploadFileSize, deliverable: uploadDeliverableType,
        version: uploadVersion, submittedBy: selectedDesignerName, notes: uploadNotes, fileId,
      });
      await reloadTeamData();
      const reqs = await requestsApi.list(); setRequests(reqs);
      alert(`Successfully uploaded ${uploadFileName}! Status updated to 'Pending Head Review'.`);
      setUploadModalOpen(false); setSelectedReqForUpload(null); setSelectedFileObj(null);
    } catch (err) { alert(err.message || 'Upload failed.'); }
  };

  // Handle Status Change (e.g. Start Work)
  const handleStartWork = async (reqId) => {
    try {
      await requestsApi.setStatus(reqId, 'In Progress', `${selectedDesignerName} commenced drafting work.`);
      const reqs = await requestsApi.list(); setRequests(reqs);
    } catch (err) { alert(err.message || 'Could not start work.'); }
  };

  // Handle Comment Submission
  const handleAddComment = async (reqId) => {
    if (!newCommentText.trim()) return;
    try {
      await requestsApi.addComment(reqId, { sender: selectedDesignerName, role: 'Design Team', text: newCommentText });
      setNewCommentText('');
      const reqs = await requestsApi.list(); setRequests(reqs);
      setSelectedReqForDetail(prev => prev ? (reqs.find(r => r.id === prev.id) || prev) : prev);
    } catch (err) { alert(err.message || 'Could not add comment.'); }
  };

  const reloadTeamData = React.useCallback(async () => {
    try {
      const [subs, notifs] = await Promise.all([submittalsApi.list(), notificationsApi.list('team')]);
      setUploadedFilesList(subs);
      setTeamNotifications(notifs.map(n => ({ ...n, id: n._id || n.id })));
    } catch { /* ignore */ }
  }, []);
  React.useEffect(() => { reloadTeamData(); }, [reloadTeamData]);

  return (
    <div className="app-layout" style={{ fontFamily: 'var(--font-sans)', display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', width: '100vw' }}>
      
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ width: '270px', minWidth: '270px', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* Logo Header */}
        <div className="sidebar-logo" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <img src="/tescologo.png" alt="Tesco Structures" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.3px', color: '#FFFFFF' }}>Tesco Structures</div>
            <div style={{ fontSize: '0.68rem', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginTop: '2px' }}>Design Team CRM</div>
          </div>
        </div>

        {/* Menu Navigation */}
        <ul className="sidebar-menu" style={{ listStyle: 'none', padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {[
            { id: 'Dashboard', label: 'Team Dashboard', icon: <LayoutDashboard size={18} />, badge: null },
            { id: 'Requirements', label: 'Assigned Tasks', icon: <Inbox size={18} />, badge: metrics.totalAssigned },

            { id: 'Submittal Status', label: 'Head Feedback', icon: <Clock size={18} />, badge: (metrics.pendingReview + metrics.revisionNeeded) > 0 ? (metrics.pendingReview + metrics.revisionNeeded) : null },
            { id: 'File Manager', label: 'File Manager', icon: <FolderOpen size={18} />, badge: uploadedFilesList.length },
            { id: 'Notifications', label: 'Notifications', icon: <Bell size={18} />, badge: teamNotifications.filter(n => !n.read).length || null },
            { id: 'Tesco ERM', label: 'Tesco ERM', icon: <Database size={18} />, badge: null }
          ].map(item => (
            <li key={item.id}>
              <div
                onClick={() => {
                  if (item.id === 'Tesco ERM') {
                    window.open('/erm.html', '_blank');
                  } else {
                    setCurrentTab(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: currentTab === item.id ? 700 : 500,
                  transition: 'all 0.2s',
                  backgroundColor: currentTab === item.id 
                    ? (item.id === 'Tesco ERM' ? '#44A810' : 'rgba(255,255,255,0.18)') 
                    : (item.id === 'Tesco ERM' ? 'rgba(68, 168, 16, 0.15)' : 'transparent'),
                  color: currentTab === item.id 
                    ? '#FFFFFF' 
                    : (item.id === 'Tesco ERM' ? '#A3E635' : 'rgba(255,255,255,0.8)')
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: item.id === 'Head Revisions' ? '#EF4444' : '#3B82F6',
                    color: '#FFFFFF'
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer Profile Info & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {activeDesigner.avatar || 'DT'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeDesigner.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#A5B4FC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeDesigner.role}</div>
            </div>
            <button 
              onClick={onLogout}
              title="Logout from CRM"
              style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              {currentTab === 'Dashboard' && 'Design Team Dashboard'}
              {currentTab === 'Requirements' && 'Assigned Tasks & Project Requirements'}
              {currentTab === 'Submittal Status' && 'Head Feedback'}
              {currentTab === 'File Manager' && 'File Manager & Submittal History'}
              {currentTab === 'Notifications' && 'Notifications'}
              {currentTab === 'Tesco ERM' && 'Tesco ERM Integration & Enterprise Sync'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Tesco Structures Design Workspace &bull; Logged in as <strong style={{ color: '#1E3A8A' }}>Design Team ({selectedDesignerName})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>


            {/* Notification Badge & Interactive Popover */}
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                title="Notifications"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: showNotificationsPopover ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                <Bell size={18} color={showNotificationsPopover ? '#2563EB' : '#475569'} />
                {teamNotifications.some(n => !n.read) && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', border: '2px solid #FFFFFF' }} />
                )}
              </button>

              {/* Notification Popover Panel */}
              {showNotificationsPopover && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '360px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  {/* Popover Header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>Notifications</span>
                      {teamNotifications.filter(n => !n.read).length > 0 && (
                        <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 800, fontSize: '0.7rem' }}>
                          {teamNotifications.filter(n => !n.read).length} New
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { notificationsApi.markAllRead('team'); setTeamNotifications(teamNotifications.map(n => ({ ...n, read: true }))); }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Popover Items List */}
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {teamNotifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif._id) notificationsApi.markRead(notif._id); setTeamNotifications(teamNotifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                          if (notif.type === 'revision') setCurrentTab('Head Revisions');
                          else if (notif.type === 'assignment') setCurrentTab('Requirements');
                          setShowNotificationsPopover(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: notif.read ? '#FFFFFF' : '#EFF6FF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: notif.read ? '#334155' : '#1E3A8A' }}>
                            {notif.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{notif.time}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.3' }}>
                          {notif.desc}
                        </div>
                      </div>
                    ))}
                    {teamNotifications.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
                        No notifications right now.
                      </div>
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #E2E8F0', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                    <span 
                      onClick={() => { setCurrentTab('Head Revisions'); setShowNotificationsPopover(false); }}
                      style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
                    >
                      View All Activity & Updates &rarr;
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
          
          {/* GORGEOUS CALENDAR DATE RANGE FILTER BAR */}
          {currentTab !== 'Notifications' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '18px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Left Side: Calendar Icon and Heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Filter Tasks by Date</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Select custom date range or use quick presets</p>
                </div>
              </div>

              {/* Center: Date Inputs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Start:</span>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>End:</span>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Right Side: Quick Filters & Reset */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(startDateFilter || endDateFilter) && (
                  <button
                    onClick={() => {
                      setStartDateFilter('');
                      setEndDateFilter('');
                    }}
                    style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {currentTab === 'Dashboard' && (
            <div>
              {/* Summary Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                  { title: 'Assigned Design', value: metrics.totalAssigned, icon: <Inbox size={20} />, trend: `${metrics.urgentCount} Urgent`, desc: 'Needs drafting', color: '#3730A3', bg: '#E0E7FF', onClick: () => { setCurrentTab('Requirements'); setStatusFilter('All'); } },
                  { title: 'In Progress', value: metrics.inProgress, icon: <Clock size={20} />, trend: 'Active draft', desc: 'Drawing on board', color: '#1D4ED8', bg: '#DBEAFE', onClick: () => { setCurrentTab('Requirements'); setStatusFilter('In Progress'); } },
                  { title: 'Waiting Review', value: metrics.pendingReview, icon: <FileCheck size={20} />, trend: 'Awaiting Head', desc: 'Submittals sent', color: '#D97706', bg: '#FEF3C7', onClick: () => { setCurrentTab('Submittal Status'); setSubmittalSubTab('Awaiting Review'); } },
                  { title: 'Revision Needed', value: metrics.revisionNeeded, icon: <AlertTriangle size={20} />, trend: 'Needs fix', desc: 'Head feedback', color: '#EF4444', bg: '#FEE2E2', onClick: () => { setCurrentTab('Submittal Status'); setSubmittalSubTab('Revisions Needed'); } },
                  { title: 'Approved Designs', value: metrics.approved, icon: <CheckCircle2 size={20} />, trend: 'Fully ready', desc: 'Release to site', color: '#166534', bg: '#DCFCE7', onClick: () => { setCurrentTab('File Manager'); } }
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    onClick={kpi.onClick}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                      minHeight: '120px',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.title}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kpi.icon}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#1E293B', fontFamily: 'var(--font-heading)' }}>{kpi.value}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem' }}>
                        <span style={{ color: kpi.color, fontWeight: 700 }}>{kpi.trend}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{kpi.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Stack: Active Requirements & Recent Uploads below it */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Active Requirements Table */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Design Requirements List</h3>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Requirements received from Design Head</p>
                    </div>
                    <button 
                      onClick={() => setCurrentTab('Requirements')}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      View All ({designerRequests.length}) <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="crm-table" style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>REQ ID / Project</th>
                          <th style={{ padding: '12px' }}>Service / Scope</th>
                          <th style={{ padding: '12px' }}>Priority</th>
                          <th style={{ padding: '12px' }}>Due Date</th>
                          <th style={{ padding: '12px' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designerRequests.slice(0, 5).map(req => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => setSelectedReqForDetail(req)}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 800, color: '#1E3A8A' }}>{req.id}</div>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>{req.projectName}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 600 }}>{req.service}</div>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px', display: 'inline-block' }}>
                                {req.requirement}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {renderPriorityBadge(req.priority)}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>
                              {req.dueDate}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {renderStatusBadge(req.status)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedReqForDetail(req); }}
                                  title="View Full Spec & Requirements"
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Specs
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenUpload(req); }}
                                  title="Upload Design File"
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <UploadCloud size={12} /> Upload
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {designerRequests.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                              No requirements found matching current search/filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Card: Recent Submittals */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent File Submittals</h3>
                    <button 
                      onClick={() => setCurrentTab('File Manager')}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      View All ({uploadedFilesList.length}) <ChevronRight size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {uploadedFilesList.slice(0, 4).map(sub => (
                      <div key={sub.id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E3A8A' }} title={sub.fileName}>{sub.fileName}</span>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                            {sub.version}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{sub.projectName} &bull; {sub.deliverable}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                          <span>Submitted: {sub.submittedDate}</span>
                          <span style={{ fontWeight: 700, color: sub.status.includes('Approved') ? '#166534' : '#D97706' }}>{sub.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: HEAD REQUIREMENTS LIST */}
          {currentTab === 'Requirements' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Design Requirements from Head</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>All design tasks & parameters assigned by the Design Head</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '8px' }}>
                  Total Tasks: {designerRequests.length}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {designerRequests.map(req => (
                  <div key={req.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      {/* Top bar: ID & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E3A8A', backgroundColor: '#E0E7FF', padding: '3px 8px', borderRadius: '6px' }}>
                          {req.id}
                        </span>
                        {renderStatusBadge(req.status)}
                      </div>

                      {/* Title & Customer */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{req.projectName}</h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>
                        {req.projectType}
                      </div>

                      {/* Deliverable Scope */}
                      <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Required Deliverables</div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B' }}>{req.service} ({req.requirement})</div>
                        {req.deliverables && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {req.deliverables.map((del, idx) => (
                              <span key={idx} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#E2E8F0', color: '#334155', fontWeight: 600 }}>
                                {del}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Structural Highlights */}
                      {req.pebDetails && (
                        <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div><strong>Dimensions:</strong> {req.pebDetails.length} x {req.pebDetails.width} x {req.pebDetails.height}</div>
                          <div><strong>Roof Type:</strong> {req.pebDetails.roofType}</div>
                          {req.pebDetails.craneRequired && <div><strong>Crane Spec:</strong> {req.pebDetails.craneRequired}</div>}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Due: <strong style={{ color: '#0F172A' }}>{req.dueDate}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {req.status === 'Assigned' && (
                          <button
                            onClick={() => handleStartWork(req.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2563EB', backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Start Work
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReqForDetail(req)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          View Specs
                        </button>
                        <button
                          onClick={() => handleOpenUpload(req)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <UploadCloud size={14} /> Upload File
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* TAB 4: SUBMITTAL STATUS & FEEDBACK */}
          {currentTab === 'Submittal Status' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Sub-tabs header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[
                    { id: 'Revisions Needed', label: `Revision (${metrics.revisionNeeded})` },
                    { id: 'Approved', label: `Approved Designs (${metrics.approved})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSubmittalSubTab(tab.id)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: submittalSubTab === tab.id ? 700 : 500,
                        backgroundColor: submittalSubTab === tab.id ? 'var(--primary-light)' : 'transparent',
                        color: submittalSubTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>


              {submittalSubTab === 'Revisions Needed' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Design Head Feedback & Revision Requests</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>PEB projects requiring drawing modifications based on Head comments</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {requests.filter(r => r.projectType === 'PEB' && (selectedDesignerName === 'All Team' ? true : r.assignedDesigner === selectedDesignerName) && (r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head'))).map(r => (
                      <div key={r.id} style={{ border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 800, fontSize: '0.78rem' }}>
                              {r.id}
                            </span>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>{r.projectName}</h3>
                          </div>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#92400E', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Revision Request
                          </span>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #FECACA', fontSize: '0.82rem', color: '#7F1D1D' }}>
                          <strong>Design Head Comments:</strong>
                          <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                            "{r.comments?.find(c => c.sender === 'Design Head')?.text || 'Please update member sizing and verify sag rod spacing as per vibration requirements.'}"
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600 }}>
                            Assigned Designer: {r.assignedDesigner}
                          </span>
                          <button
                            onClick={() => handleOpenUpload(r)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <UploadCloud size={14} /> Re-Upload Revised Drawing (v2.0)
                          </button>
                        </div>
                      </div>
                    ))}

                    {requests.filter(r => r.projectType === 'PEB' && (selectedDesignerName === 'All Team' ? true : r.assignedDesigner === selectedDesignerName) && (r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head'))).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                        <CheckCircle2 size={32} color="#166534" style={{ marginBottom: '8px' }} />
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>All clear! No pending revision requests from Design Head.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {submittalSubTab === 'Approved' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Approved Design Records</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>Drawings and estimation sheets fully signed-off by Design Head</p>
                  </div>

                  <div className="table-wrapper">
                    <table className="crm-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Project Name / ID</th>
                          <th style={{ padding: '12px' }}>Deliverable</th>
                          <th style={{ padding: '12px' }}>Approved File</th>
                          <th style={{ padding: '12px' }}>Designer</th>
                          <th style={{ padding: '12px' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Approved' || r.status === 'Completed')).map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 800, color: '#1E3A8A' }}>{r.id}</div>
                              <div style={{ fontWeight: 700 }}>{r.projectName}</div>
                            </td>
                            <td style={{ padding: '12px' }}>{r.service}</td>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#166534' }}>
                              {r.attachments && r.attachments[0] ? r.attachments[0].name : `${r.projectName}_Layout_Approved.dwg`}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{r.assignedDesigner}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => setSelectedReqForDetail(r)}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                View Specs
                              </button>
                            </td>
                          </tr>
                        ))}
                        {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Approved' || r.status === 'Completed')).length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                              No approved PEB designs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: FILE MANAGER */}
          {currentTab === 'File Manager' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Team File Manager & Submittal Archives</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>All uploaded CAD drawings, PDF packages, and 3D submittals</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => alert('Exporting drawing manifest to Excel...')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Export Manifest
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="crm-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>File Name</th>
                      <th style={{ padding: '12px' }}>Project</th>
                      <th style={{ padding: '12px' }}>Type / Size</th>
                      <th style={{ padding: '12px' }}>Version</th>
                      <th style={{ padding: '12px' }}>Submitted By</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFilesList.map(file => (
                      <tr key={file.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#1E3A8A' }}>
                          {file.fileName}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{file.projectName}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', fontSize: '0.72rem', fontWeight: 600 }}>
                            {file.fileType} ({file.fileSize})
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#2563EB' }}>{file.version}</td>
                        <td style={{ padding: '12px' }}>{file.submittedBy}</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>{file.submittedDate}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => alert(`Downloading ${file.fileName}...`)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Download size={12} /> CAD Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {currentTab === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Alerts & Updates</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    {teamNotifications.filter(n => !n.read).length} unread notifications
                  </p>
                </div>
                {teamNotifications.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={() => { notificationsApi.markAllRead('team'); setTeamNotifications(teamNotifications.map(n => ({ ...n, read: true }))); }}
                    style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teamNotifications.map(notif => {
                  let badgeBg = '#EFF6FF';
                  let badgeColor = '#2563EB';
                  if (notif.type === 'revision') {
                    badgeBg = '#FEF3C7';
                    badgeColor = '#D97706';
                  } else if (notif.type === 'approval' || notif.type === 'approved') {
                    badgeBg = '#DEF7EC';
                    badgeColor = '#059669';
                  }
                  
                  return (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        if (notif._id) notificationsApi.markRead(notif._id); setTeamNotifications(teamNotifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        if (notif.type === 'revision') {
                          setCurrentTab('Submittal Status');
                        } else {
                          setCurrentTab('Requirements');
                        }
                      }}
                      style={{ 
                        backgroundColor: notif.read ? '#FFFFFF' : '#F8FAFC', 
                        border: notif.read ? '1px solid var(--border-color)' : '1px solid #BFDBFE', 
                        borderRadius: '12px', 
                        padding: '16px 20px', 
                        display: 'flex', 
                        alignItems: 'start', 
                        gap: '16px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <div style={{ 
                        backgroundColor: badgeBg, 
                        color: badgeColor, 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {notif.type === 'revision' ? '⚠' : '✓'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: notif.read ? 600 : 700 }}>{notif.title}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{notif.time}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0', lineHeight: '1.4' }}>{notif.desc}</p>
                      </div>
                      {!notif.read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', alignSelf: 'center' }}></span>
                      )}
                    </div>
                  );
                })}

                {teamNotifications.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>
                    No notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: TESCO ERM INTEGRATION */}
          {currentTab === 'Tesco ERM' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* TOP SUMMARY STATS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ backgroundColor: ermSyncStatus === 'connected' ? '#DEF7EC' : ermSyncStatus === 'syncing' ? '#E1EFFE' : '#FDE8E8', color: ermSyncStatus === 'connected' ? '#03543F' : ermSyncStatus === 'syncing' ? '#1E429F' : '#9B1C1C', padding: '12px', borderRadius: '10px' }}>
                    <Cpu size={24} className={ermSyncStatus === 'syncing' ? 'spin-animation' : ''} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Tesco ERM API Bridge</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ermSyncStatus === 'connected' ? 'Connected' : ermSyncStatus === 'syncing' ? 'Syncing...' : 'Disconnected'}
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ermSyncStatus === 'connected' ? '#10B981' : ermSyncStatus === 'syncing' ? '#3B82F6' : '#EF4444' }}></span>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ backgroundColor: '#EEF2F6', color: '#1E3A8A', padding: '12px', borderRadius: '10px' }}>
                    <Database size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Integrated Entities</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      {ermProjectMapping.filter(p => p.status === 'Synced').length} / {ermProjectMapping.length} Mapped
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ backgroundColor: '#E0E7FF', color: '#3730A3', padding: '12px', borderRadius: '10px' }}>
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Last Full Sync</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      {lastErmSync}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT SPLIT GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                
                {/* LEFT COLUMN: MATERIAL INVENTORY sync */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Tesco Enterprise Material Allocations</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>Sync design material estimates directly to Tesco warehouse and steel yard modules.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {ermInventory.map(item => {
                      const percentage = Math.round((item.allocated / item.stock) * 100);
                      const isLow = (item.stock - item.allocated) <= item.warningLevel;
                      return (
                        <div key={item.id} style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9rem' }}>{item.material}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category: {item.category} | Part ID: {item.id}</div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: isLow ? '#FEE2E2' : '#E2E8F0', color: isLow ? '#991B1B' : '#475569' }}>
                              {isLow ? 'Critical Low' : 'Adequate'}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ margin: '12px 0 8px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>
                              <span>Allocated: {item.allocated} / {item.stock} {item.unit}</span>
                              <span>{percentage}% Used</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: isLow ? '#EF4444' : '#34328C', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                            <button
                              onClick={() => handleUpdateAllocation(item.id, -5)}
                              disabled={item.allocated <= 0}
                              style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: item.allocated <= 0 ? 'not-allowed' : 'pointer', opacity: item.allocated <= 0 ? 0.5 : 1 }}
                            >
                              -5 {item.unit}
                            </button>
                            <button
                              onClick={() => handleUpdateAllocation(item.id, 5)}
                              disabled={item.allocated >= item.stock}
                              style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: item.allocated >= item.stock ? 'not-allowed' : 'pointer', opacity: item.allocated >= item.stock ? 0.5 : 1 }}
                            >
                              +5 {item.unit}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT COLUMN: ENTITY MAPPING & SYNC LOG CONSOLE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Entity Mappings */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Project CRM ⇆ ERM Linkages</h3>
                      <button 
                        onClick={triggerErmSync} 
                        disabled={ermSyncStatus === 'syncing'}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#34328C', color: '#FFFFFF', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <RefreshCw size={12} className={ermSyncStatus === 'syncing' ? 'spin-animation' : ''} />
                        Sync Now
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {ermProjectMapping.map(proj => (
                        <div key={proj.crmId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1E293B' }}>{proj.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>CRM: {proj.crmId} ⇆ ERM: <code style={{ color: '#1E3A8A', fontWeight: 700 }}>{proj.ermId}</code></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: proj.status === 'Synced' ? '#DEF7EC' : '#FEF08A', color: proj.status === 'Synced' ? '#03543F' : '#713F12' }}>
                              {proj.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REST API Console Logs */}
                  <div style={{ backgroundColor: '#0F172A', borderRadius: '14px', border: '1px solid #1E293B', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', height: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                      <div style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        Tesco Gateway Console Log
                      </div>
                      <button
                        onClick={() => setErmSyncLogs([{ id: 1, type: 'info', text: 'Console cleared. Pipeline active.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }])}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Clear Logs
                      </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.72rem', color: '#E2E8F0' }}>
                      {ermSyncLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                          <span style={{ color: '#64748B', flexShrink: 0 }}>[{log.timestamp}]</span>
                          <span style={{ color: log.type === 'success' ? '#4ADE80' : log.type === 'error' ? '#F87171' : '#38BDF8' }}>
                            {log.type === 'success' ? '✔' : log.type === 'error' ? '✖' : 'ℹ'} {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* REQUIREMENT DETAIL MODAL */}
      {/* REQUIREMENT DETAIL SLIDING DRAWER */}
      {selectedReqForDetail && (
        <div className="drawer-backdrop" onClick={() => setSelectedReqForDetail(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div className="drawer-title-area" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="drawer-subtitle" style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{selectedReqForDetail.id} &bull; {selectedReqForDetail.projectType || 'PEB'} Project</span>
                <h2 className="drawer-title" style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>{selectedReqForDetail.projectName}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {renderStatusBadge(selectedReqForDetail.status)}
                  {renderPriorityBadge(selectedReqForDetail.priority)}
                </div>
              </div>
              <button className="action-btn" onClick={() => setSelectedReqForDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div style={{ padding: '0 24px' }}>
              <div className="drawer-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', gap: '16px' }}>
                {['Requirements', 'Attachments', 'Comments', 'Timeline', 'Submit Deliverable'].map(tab => (
                  <button
                    key={tab}
                    className={`drawer-tab ${activeDrawerTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveDrawerTab(tab)}
                    style={{
                      padding: '12px 4px',
                      fontSize: '0.85rem',
                      fontWeight: activeDrawerTab === tab ? 600 : 500,
                      color: activeDrawerTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                      border: 'none',
                      background: 'none',
                      borderBottom: activeDrawerTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {activeDrawerTab === 'Requirements' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="info-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Drawing Scope & Service</div>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{selectedReqForDetail.service}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Format: <strong>{selectedReqForDetail.requirement}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Due Date: <strong>{selectedReqForDetail.dueDate}</strong></div>
                      </div>

                      <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Project Location & Lead</div>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>{selectedReqForDetail.location || 'MIDC Chakan Industrial Zone'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Lead Reference: <strong>{selectedReqForDetail.leadId || 'N/A'}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Assigned Designer: <strong>{selectedReqForDetail.assignedDesigner}</strong></div>
                      </div>
                    </div>

                    {/* PEB Structural Details */}
                    {selectedReqForDetail.pebDetails && (
                      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px' }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '10px', margin: 0 }}>Structural Specification Matrix</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem', color: '#1E40AF', marginTop: '8px' }}>
                          <div>Span: <strong>{selectedReqForDetail.pebDetails.span}</strong></div>
                          <div>Length: <strong>{selectedReqForDetail.pebDetails.length}</strong></div>
                          <div>Width: <strong>{selectedReqForDetail.pebDetails.width}</strong></div>
                          <div>Clear Height: <strong>{selectedReqForDetail.pebDetails.height}</strong></div>
                          <div>Built-up Area: <strong>{selectedReqForDetail.pebDetails.builtUpArea}</strong></div>
                          <div>Roof System: <strong>{selectedReqForDetail.pebDetails.roofType}</strong></div>
                          {selectedReqForDetail.pebDetails.craneRequired && (
                            <div style={{ gridColumn: 'span 3', marginTop: '4px' }}>Crane Specs: <strong>{selectedReqForDetail.pebDetails.craneRequired}</strong></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'Attachments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '4px', margin: 0 }}>Input Attachments & Reference Files</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedReqForDetail.attachments && selectedReqForDetail.attachments.length > 0 ? (
                      selectedReqForDetail.attachments.map((att, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Paperclip size={16} color="#2563EB" />
                            <div>
                              <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>{att.name}</span>
                              <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Size: {att.size} &bull; Type: {att.type || 'Unknown'}</span>
                            </div>
                          </div>
                          <button 
                            className="action-btn"
                            onClick={() => alert(`Downloading ${att.name}...`)}
                            style={{ padding: '6px', borderRadius: '50%', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', border: '1px dashed #E2E8F0', borderRadius: '8px' }}>
                        No reference attachments uploaded.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'Comments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>Comments & Review Notes</h4>
                  
                  {/* Comments list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', paddingRight: '4px', maxHeight: '350px' }}>
                    {selectedReqForDetail.comments && selectedReqForDetail.comments.length > 0 ? (
                      selectedReqForDetail.comments.map((c, idx) => (
                        <div key={idx} style={{ padding: '12px', borderRadius: '10px', backgroundColor: c.sender === 'Design Head' ? '#FEF3C7' : '#F1F5F9', border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            <span>{c.sender} ({c.role})</span>
                            <span style={{ color: '#94A3B8', fontWeight: 500 }}>{c.time}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#0F172A', lineHeight: '1.4' }}>{c.text}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                        No comments yet. Start a discussion with the Design Head below.
                      </div>
                    )}
                  </div>

                  {/* Add comment box */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <input
                      type="text"
                      placeholder="Add note or update for Design Head..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(selectedReqForDetail.id); }}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => handleAddComment(selectedReqForDetail.id)}
                      style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'Timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px', margin: 0 }}>Project Activity Timeline</h4>
                  <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #E2E8F0', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedReqForDetail.history && selectedReqForDetail.history.length > 0 ? (
                      selectedReqForDetail.history.map((h, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          {/* Dot indicator */}
                          <div style={{ position: 'absolute', left: '-31px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563EB', border: '3px solid #FFFFFF' }} />
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{h.time}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>{h.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>{h.desc}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-31px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563EB', border: '3px solid #FFFFFF' }} />
                        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Assignment Time</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>Requirement Assigned</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>Assigned to {selectedReqForDetail.assignedDesigner} by Design Head.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'Submit Deliverable' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>Submit Design Deliverable</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '-8px', margin: 0 }}>
                    Upload your CAD layouts, models, structural analysis files, or PDFs to submit directly to the Design Head for review.
                  </p>

                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Select Design File</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => modalFileInputRef.current?.click()}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Choose File
                          </button>
                          <span style={{ fontSize: '0.8rem', color: uploadFileName ? '#0F172A' : '#94A3B8', fontWeight: uploadFileName ? 600 : 400 }}>
                            {uploadFileName || 'No file selected (Supports .dwg, .pdf, .std, .skp, etc.)'}
                          </span>
                          <input 
                            type="file"
                            ref={modalFileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Software Engine</label>
                          <select 
                            value={uploadFileType}
                            onChange={(e) => setUploadFileType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          >
                            <option value="AutoCAD">AutoCAD (2D Layouts)</option>
                            <option value="STAAD">STAAD.Pro (Structural Analysis)</option>
                            <option value="3D Model">Tekla / SketchUp (3D Models)</option>
                            <option value="PDF">PDF Report / Calculations</option>
                            <option value="ZIP Archive">ZIP Package (Combined deliverables)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Deliverable Type</label>
                          <select 
                            value={uploadDeliverableType}
                            onChange={(e) => setUploadDeliverableType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          >
                            <option value="2D Drawing">2D Drawing / GA Layout</option>
                            <option value="3D Structural Model">3D Structural Model / BIM</option>
                            <option value="Structural Calculation Report">Design / Member Estimation Calcs</option>
                            <option value="Fabrication Details">Fabrication / Erection details</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Submission Version</label>
                          <input 
                            type="text" 
                            value={uploadVersion}
                            onChange={(e) => setUploadVersion(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>File Size</label>
                          <input 
                            type="text" 
                            disabled
                            value={uploadFileSize}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', fontSize: '0.8rem', color: '#64748B' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Drafting assumptions & submittal notes</label>
                        <textarea 
                          rows={3}
                          placeholder="Include assumptions, code standards used, load specs, or details..."
                          value={uploadNotes}
                          onChange={(e) => setUploadNotes(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            setSelectedReqForUpload(selectedReqForDetail);
                            setTimeout(() => {
                              const eventMock = { preventDefault: () => {} };
                              handleUploadSubmit(eventMock);
                            }, 50);
                          }}
                          style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <UploadCloud size={16} /> Submit Submittal File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer" style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedReqForDetail(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
              {selectedReqForDetail.status === 'Assigned' && (
                <button
                  onClick={() => {
                    handleStartWork(selectedReqForDetail.id);
                    setSelectedReqForDetail(prev => ({ ...prev, status: 'In Progress' }));
                  }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Start Work
                </button>
              )}
              <button
                onClick={() => setActiveDrawerTab('Submit Deliverable')}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <UploadCloud size={16} /> Submit Deliverable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK UPLOAD MODAL */}
      {uploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button
              onClick={() => setUploadModalOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              Upload Design File & Submit for Review
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '20px' }}>
              {selectedReqForUpload ? `Project: ${selectedReqForUpload.projectName} (${selectedReqForUpload.id})` : 'Select a project to upload'}
            </p>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Select File Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select Design File *</label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".dwg,.dxf,.pdf,.skp,.std,.zip,.rar,.png,.jpg"
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #2563EB', backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    <UploadCloud size={16} /> Browse File...
                  </button>
                  <span style={{ fontSize: '0.78rem', color: selectedFileObj ? '#166534' : '#64748B', fontWeight: selectedFileObj ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFileObj ? `Selected: ${selectedFileObj.name} (${uploadFileSize})` : 'No file selected (or enter name manually)'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>File Name</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. PEB_Warehouse_Layout_v1.0.dwg"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Deliverable Category</label>
                  <select
                    value={uploadDeliverableType}
                    onChange={(e) => setUploadDeliverableType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    <option value="2D Layout & Detailing">2D Layout & Detailing</option>
                    <option value="3D Exterior Render">3D Exterior Render</option>
                    <option value="Structural Calculations">Structural Calculations</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Revision Tag</label>
                  <input
                    type="text"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Engineer Remarks</label>
                <textarea
                  rows={3}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} /> Submit to Design Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function HourglassIcon() {
  return <Clock size={12} />;
}

function InfoIcon() {
  return <FileText size={16} />;
}
