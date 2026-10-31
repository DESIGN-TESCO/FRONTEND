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
import { requestsApi, submittalsApi, notificationsApi, filesApi, getUser } from './api/client';
import { notify } from './notify';

export default function DesignTeamDashboard({
  requests = [],
  setRequests,
  designers = [],
  setDesigners,
  onLogout,
  loginEmail
}) {
  // The logged-in team member (authoritative identity from the saved session).
  const me = getUser() || {};
  const myName = me.name || '';
  const myInitials = (myName || 'DT').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  // A request belongs to this member if assigned to their account id or their name.
  const mineReq = React.useCallback((r) => (
    !!r && ((me._id && String(r.assignedUserId) === String(me._id)) || (myName && r.assignedDesigner === myName))
  ), [me._id, myName]);

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState('Dashboard');

  // Identity filter — locked to the logged-in member (their own tasks only).
  const [selectedDesignerName, setSelectedDesignerName] = useState(myName || '');

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

  // Project details for the open task (live from Procurement) + the current user's
  // notifications only (the specific assigned member), falling back to broadcasts.
  const [detailProject, setDetailProject] = useState(null);
  const [detailProjectLoading, setDetailProjectLoading] = useState(false);
  const visibleNotifications = useMemo(() => (
    selectedDesignerName === 'All Team'
      ? teamNotifications
      : teamNotifications.filter(n => !n.designerName || n.designerName === selectedDesignerName)
  ), [teamNotifications, selectedDesignerName]);

  // Open the exact task a notification points at (and mark it read).
  const openTaskFromNotification = async (notif) => {
    try { const nid = notif._id || notif.id; if (nid) { await notificationsApi.markRead(nid); setTeamNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))); } } catch { /* ignore */ }
    setShowNotificationsPopover(false);
    const req = notif.requestId ? requests.find(r => r.id === notif.requestId) : null;
    if (req) { setSelectedReqForDetail(req); setActiveDrawerTab('Requirements'); }
    else if (notif.type === 'revision') { setCurrentTab('Submittal Status'); }
    else { setCurrentTab('Requirements'); }
  };

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
  const [uploadFileSize, setUploadFileSize] = useState('');
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

  // (Tesco ERM integration removed)

  // Active Designer Profile object
  const activeDesigner = useMemo(() => ({
    name: myName || 'Design Team',
    role: me.designation || 'Design Team',
    avatar: myInitials,
    status: 'Available',
    employeeId: me.employeeId || '',
  }), [myName, me.designation, me.employeeId, myInitials]);

  // Filtered requests: Exclusively PEB project types for Design Team CRM
  const designerRequests = useMemo(() => {
    return requests.filter(r => {
      // Exclusively PEB projects for Design Team CRM
      const isPEB = r.projectType === 'PEB';

      // Only tasks assigned to the logged-in team member.
      const isAssignedToCurrent = mineReq(r);

      const matchesSearch = 
        r.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' ? true : r.priority === priorityFilter;

      const matchesDateRange = (!startDateFilter || r.dueDate >= startDateFilter) && (!endDateFilter || r.dueDate <= endDateFilter);

      return isAssignedToCurrent && matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [requests, mineReq, searchTerm, statusFilter, priorityFilter, startDateFilter, endDateFilter]);

  // Summary Metrics for Design Team (PEB Projects Only)
  const metrics = useMemo(() => {
    const assigned = requests.filter(r => mineReq(r));
    return {
      totalAssigned: assigned.length,
      inProgress: assigned.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length,
      pendingReview: assigned.filter(r => r.status === 'Pending Review' || r.status === 'Under Review').length,
      approved: assigned.filter(r => r.status === 'Approved' || r.status === 'Completed').length,
      revisionNeeded: assigned.filter(r => r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head')).length,
      urgentCount: assigned.filter(r => r.priority === 'Urgent').length
    };
  }, [requests, mineReq]);

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> In Production</span>;
      case 'Assigned':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#E0E7FF', color: '#3730A3', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Inbox size={12} /> Assigned from Head</span>;
      case 'Pending Review':
      case 'Under Review':
      case 'Submitted for Approval':
      case 'Resubmitted':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#92400E', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HourglassIcon /> {status === 'Resubmitted' ? 'Resubmitted — awaiting review' : 'Submitted — awaiting review'}</span>;
      case 'Changes Requested':
      case 'Rework Required':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FFEDD5', color: '#9A3412', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Changes Requested</span>;
      case 'Rejected':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Rejected</span>;
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
    setUploadFileName('');
    setUploadNotes('');
    setUploadModalOpen(true);
  };

  // Multiple-file "Submit for Approval" state + handler (drawer).
  const [submitFiles, setSubmitFiles] = useState([]);
  const [submitRemarks, setSubmitRemarks] = useState('');
  const detectType = (fileName) => {
    const ext = (String(fileName).split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'dwg' || ext === 'dxf') return 'AutoCAD';
    if (ext === 'skp' || ext === 'fbx') return '3D Model';
    if (ext === 'std') return 'STAAD';
    if (ext === 'zip' || ext === 'rar') return 'ZIP Archive';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'Image';
    return 'File';
  };
  const handleSubmitForApproval = async () => {
    const req = selectedReqForDetail;
    if (!req) return;
    if (submitFiles.length === 0) { notify('Please choose at least one completed design file to submit.'); return; }
    try {
      for (const f of submitFiles) {
        const up = await filesApi.upload(f, { entity: 'submittal', entityId: req.id, uploadedBy: myName });
        await submittalsApi.create({
          reqId: req.id, projectName: req.projectName, fileName: f.name,
          fileType: detectType(f.name), fileSize: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
          deliverable: uploadDeliverableType, version: uploadVersion,
          submittedBy: myName, notes: submitRemarks, fileId: up.fileId, silent: true,
        });
      }
      const updated = await requestsApi.submitForApproval(req.id, { remarks: submitRemarks, submittedBy: myName });
      await reloadTeamData();
      const reqs = await requestsApi.list(); setRequests(reqs);
      setSelectedReqForDetail(reqs.find(r => r.id === req.id) || updated);
      setSubmitFiles([]); setSubmitRemarks('');
      notify('Submitted for approval. The Design Head has been notified.');
    } catch (err) { notify(err.message || 'Could not submit for approval.'); }
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
      notify(`Successfully uploaded ${uploadFileName}! Status updated to 'Pending Head Review'.`);
      setUploadModalOpen(false); setSelectedReqForUpload(null); setSelectedFileObj(null);
    } catch (err) { notify(err.message || 'Upload failed.'); }
  };

  // Handle Status Change (e.g. Start Work)
  const handleStartWork = async (reqId) => {
    try {
      await requestsApi.setStatus(reqId, 'In Progress', `${selectedDesignerName} commenced drafting work.`);
      const reqs = await requestsApi.list(); setRequests(reqs);
    } catch (err) { notify(err.message || 'Could not start work.'); }
  };

  // Handle Comment Submission
  const handleAddComment = async (reqId) => {
    if (!newCommentText.trim()) return;
    try {
      await requestsApi.addComment(reqId, { sender: selectedDesignerName, role: 'Design Team', text: newCommentText });
      setNewCommentText('');
      const reqs = await requestsApi.list(); setRequests(reqs);
      setSelectedReqForDetail(prev => prev ? (reqs.find(r => r.id === prev.id) || prev) : prev);
    } catch (err) { notify(err.message || 'Could not add comment.'); }
  };

  const exportManifest = () => {
    const rows = [['File Name', 'Project', 'Type', 'Size', 'Version', 'Submitted By', 'Date', 'Status']];
    uploadedFilesList.forEach(f => rows.push([f.fileName, f.projectName, f.fileType, f.fileSize, f.version, f.submittedBy, f.submittedDate, f.status]));
    const csv = rows.map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = href; a.download = 'submittal_manifest.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2000);
  };

  const reloadTeamData = React.useCallback(async () => {
    try {
      const [subs, notifs] = await Promise.all([submittalsApi.list(), notificationsApi.list('team')]);
      setUploadedFilesList(subs);
      setTeamNotifications(notifs.map(n => ({ ...n, id: n._id || n.id })));
    } catch { /* ignore */ }
  }, []);
  React.useEffect(() => { reloadTeamData(); }, [reloadTeamData]);

  React.useEffect(() => {
    let cancelled = false;
    if (selectedReqForDetail && selectedReqForDetail.id) {
      setDetailProject(null); setDetailProjectLoading(true);
      requestsApi.project(selectedReqForDetail.id)
        .then(pj => { if (!cancelled) setDetailProject(pj); })
        .catch(() => { if (!cancelled) setDetailProject(null); })
        .finally(() => { if (!cancelled) setDetailProjectLoading(false); });
    } else { setDetailProject(null); }
    return () => { cancelled = true; };
  }, [selectedReqForDetail && selectedReqForDetail.id]);

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
            { id: 'Notifications', label: 'Notifications', icon: <Bell size={18} />, badge: visibleNotifications.filter(n => !n.read).length || null }
          ].map(item => (
            <li key={item.id}>
              <div
                onClick={() => setCurrentTab(item.id)}
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
                  backgroundColor: currentTab === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: currentTab === item.id ? '#FFFFFF' : 'rgba(255,255,255,0.8)'
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
              <div style={{ fontSize: '0.68rem', color: '#A5B4FC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeDesigner.role}{activeDesigner.employeeId ? ` · ${activeDesigner.employeeId}` : ''}</div>
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
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Tesco Structures Design Workspace &bull; Logged in as <strong style={{ color: '#1E3A8A' }}>{myName || 'Design Team'}{me.designation ? ` · ${me.designation}` : ''}</strong>
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
                {visibleNotifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', backgroundColor: '#EF4444', border: '2px solid #FFFFFF', color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{visibleNotifications.filter(n => !n.read).length}</span>
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
                      {visibleNotifications.filter(n => !n.read).length > 0 && (
                        <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 800, fontSize: '0.7rem' }}>
                          {visibleNotifications.filter(n => !n.read).length} New
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
                    {visibleNotifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => openTaskFromNotification(notif)}
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
                        {notif.requestId ? <div style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>{notif.requestId} &rarr; open task</div> : null}
                      </div>
                    ))}
                    {visibleNotifications.length === 0 && (
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
                    {requests.filter(r => mineReq(r) && (r.status === 'Revision' || r.status === 'Revision Requested' || r.status === 'Changes Requested' || r.status === 'Rework Required' || r.comments?.some(c => c.sender === 'Design Head'))).map(r => (
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

                    {requests.filter(r => mineReq(r) && (r.status === 'Revision' || r.status === 'Revision Requested' || r.status === 'Changes Requested' || r.status === 'Rework Required' || r.comments?.some(c => c.sender === 'Design Head'))).length === 0 && (
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
                  <button onClick={exportManifest} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                            onClick={() => file.fileId ? filesApi.download(file.fileId, file.fileName) : notify('No file stored for this submittal.')}
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
                    {visibleNotifications.filter(n => !n.read).length} unread notifications
                  </p>
                </div>
                {visibleNotifications.filter(n => !n.read).length > 0 && (
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
                {visibleNotifications.map(notif => {
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
                      onClick={() => openTaskFromNotification(notif)}
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
                        {notif.requestId ? <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>{notif.requestId} &rarr; open task</span> : null}
                      </div>
                      {!notif.read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', alignSelf: 'center' }}></span>
                      )}
                    </div>
                  );
                })}

                {visibleNotifications.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>
                    No notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: TESCO ERM INTEGRATION */}
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

            {/* PROJECT DETAILS (auto-fetched from Procurement, read-only) */}
            {(() => {
              const pj = detailProject || {};
              const val = (x) => (x === 0 || x) ? x : '\u2014';
              const rows = [
                ['Project Name', val(pj.projectName || selectedReqForDetail.projectName)],
                ['Project Code', val(pj.projectCode || selectedReqForDetail.procurementProjectCode)],
                ['Client', val(pj.client || selectedReqForDetail.customerName)],
                ['Location', val(pj.location || selectedReqForDetail.location)],
                ['Project Type', val(pj.projectType || selectedReqForDetail.projectType)],
                ['Requirement', val(pj.requirement || selectedReqForDetail.requirement || selectedReqForDetail.service)],
                ['Priority', val(pj.priority || selectedReqForDetail.priority)],
                ['Due Date', val(pj.dueDate || selectedReqForDetail.dueDate)],
              ];
              if (pj.projectSize) rows.push(['Project Size', pj.projectSize]);
              if (pj.materialDescription) rows.push(['Material / Scope', pj.materialDescription]);
              if (pj.contactDetails) rows.push(['Contact', pj.contactDetails]);
              if (pj.siteAddress) rows.push(['Site Address', pj.siteAddress]);
              return (
                <div style={{ margin: '16px 24px 0', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A' }}>Project Details</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: selectedReqForDetail.source === 'procurement' ? '#2563EB' : '#94A3B8' }}>
                      {detailProjectLoading ? 'Loading\u2026' : (selectedReqForDetail.source === 'procurement' ? 'From Procurement' : 'Design CRM')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                    {rows.map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8' }}>{k}</span>
                        <span style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 500, wordBreak: 'break-word' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {selectedReqForDetail.description && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8' }}>Description</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedReqForDetail.description}</p>
                    </div>
                  )}
                </div>
              );
            })()}

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
                            onClick={() => att.fileId ? filesApi.download(att.fileId, att.name) : notify('No file stored for this attachment.')}
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
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>Submit Design for Approval</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                    Attach your completed design files (PDF, DWG, DXF, JPG, PNG, STAAD, ZIP, etc.), add remarks, and submit to the Design Head for review.
                  </p>

                  {/* If the Head asked for changes / rejected, show the feedback here before resubmitting. */}
                  {['Changes Requested', 'Rework Required', 'Rejected', 'Revision Requested'].includes(selectedReqForDetail.status) && (selectedReqForDetail.changeRemarks || selectedReqForDetail.rejectionReason) && (
                    <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#9A3412', marginBottom: '4px' }}>Design Head feedback — please address and resubmit</div>
                      <div style={{ fontSize: '0.82rem', color: '#7C2D12' }}>{selectedReqForDetail.changeRemarks || selectedReqForDetail.rejectionReason}</div>
                    </div>
                  )}

                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Design Files</label>
                        <button type="button" onClick={() => modalFileInputRef.current?.click()}
                          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                          Choose Files
                        </button>
                        <input type="file" multiple ref={modalFileInputRef} style={{ display: 'none' }}
                          onChange={(e) => { const picked = Array.from(e.target.files || []); e.target.value = ''; if (picked.length) setSubmitFiles(prev => [...prev, ...picked]); }} />
                        {submitFiles.length > 0 ? (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {submitFiles.map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '7px 10px' }}>
                                <FileText size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                <span style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap' }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                <button type="button" onClick={() => setSubmitFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>Remove</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94A3B8' }}>No files selected yet.</div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Deliverable Type</label>
                          <select value={uploadDeliverableType} onChange={(e) => setUploadDeliverableType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}>
                            <option value="2D Drawing">2D Drawing / GA Layout</option>
                            <option value="3D Structural Model">3D Structural Model / BIM</option>
                            <option value="Structural Calculation Report">Design / Member Estimation Calcs</option>
                            <option value="Fabrication Details">Fabrication / Erection details</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Submission Version</label>
                          <input type="text" value={uploadVersion} onChange={(e) => setUploadVersion(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Remarks / Comments</label>
                        <textarea rows={3} placeholder="Assumptions, code standards used, load specs, or notes for the Design Head..."
                          value={submitRemarks} onChange={(e) => setSubmitRemarks(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button type="button" onClick={handleSubmitForApproval}
                          style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UploadCloud size={16} /> {['Changes Requested', 'Rework Required', 'Rejected', 'Revision Requested'].includes(selectedReqForDetail.status) ? 'Resubmit for Approval' : 'Submit for Approval'}
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
