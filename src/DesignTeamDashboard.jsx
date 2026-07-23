import React, { useState, useMemo } from 'react';
import {
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

  // Modal & Popover States
  const [selectedReqForDetail, setSelectedReqForDetail] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReqForUpload, setSelectedReqForUpload] = useState(null);
  const [revisionModalReq, setRevisionModalReq] = useState(null);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);

  // Team Notifications state
  const [teamNotifications, setTeamNotifications] = useState([
    {
      id: 'NOTIF-01',
      title: 'Revision Requested on REQ-2026-002',
      desc: 'Design Head requested revision: Correct sag rod spacing for heavy vibration loads.',
      time: '10 mins ago',
      read: false,
      type: 'revision'
    },
    {
      id: 'NOTIF-02',
      title: 'New PEB Assignment: REQ-2026-001',
      desc: 'Design Head assigned PEB Warehouse project for 2D + 3D submittals.',
      time: '1 hour ago',
      read: false,
      type: 'assignment'
    },
    {
      id: 'NOTIF-03',
      title: 'Drawing Approved by Head',
      desc: 'Glass_Canopy_3D_Render_v1.0.pdf approved for fabrication.',
      time: 'Yesterday',
      read: true,
      type: 'approval'
    }
  ]);

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
  const [uploadDeliverableType, setUploadDeliverableType] = useState('2D Shop Drawing');
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
  const [uploadedFilesList, setUploadedFilesList] = useState([
    {
      id: 'SUB-001',
      reqId: 'REQ-2026-001',
      projectName: 'PEB Warehouse',
      fileName: 'PEB_Warehouse_Layout_v1.0.dwg',
      fileType: 'AutoCAD',
      fileSize: '18.2 MB',
      deliverable: '2D Layout & Fabrication Drawing',
      version: 'v1.0',
      submittedBy: 'Amit Patel',
      submittedDate: '2026-07-16 02:30 PM',
      status: 'Pending Head Review',
      notes: 'Structural member sizing completed according to MIDC Chakan wind load ratings.'
    },
    {
      id: 'SUB-002',
      reqId: 'REQ-2026-003',
      projectName: 'Commercial Glass Canopy',
      fileName: 'Glass_Canopy_3D_Render_v1.0.pdf',
      fileType: 'PDF',
      fileSize: '9.4 MB',
      deliverable: '3D Render & Structural Calculation',
      version: 'v1.0',
      submittedBy: 'Priya Das',
      submittedDate: '2026-07-16 04:15 PM',
      status: 'Approved by Head',
      notes: 'Spider fitting connection details included with safety glass loads.'
    },
    {
      id: 'SUB-003',
      reqId: 'REQ-2026-002',
      projectName: 'Residential Roof Structure',
      fileName: 'Roof_Truss_Framing_v1.1.dwg',
      fileType: 'AutoCAD',
      fileSize: '12.6 MB',
      deliverable: '2D Truss Elevation & Gutter Detail',
      version: 'v1.1',
      submittedBy: 'Vikram Malhotra',
      submittedDate: '2026-07-17 11:00 AM',
      status: 'Revision Requested',
      notes: 'Revised high-gradient gutter slope calculation for heavy monsoon loads.'
    }
  ]);

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

      return isPEB && isAssignedToCurrent && matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, selectedDesignerName, searchTerm, statusFilter, priorityFilter]);

  // Summary Metrics for Design Team (PEB Projects Only)
  const metrics = useMemo(() => {
    const assigned = requests.filter(r => r.projectType === 'PEB' && (selectedDesignerName === 'All Team' ? true : r.assignedDesigner === selectedDesignerName));
    return {
      totalAssigned: assigned.length,
      inProgress: assigned.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length,
      pendingReview: assigned.filter(r => r.status === 'Pending Review' || r.status === 'Under Review').length,
      approved: assigned.filter(r => r.status === 'Approved' || r.status === 'Completed').length,
      revisionNeeded: assigned.filter(r => r.status === 'Revision' || r.status === 'Revision Requested').length,
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
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedReqForUpload) return;

    const newSubmittal = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      reqId: selectedReqForUpload.id,
      projectName: selectedReqForUpload.projectName,
      fileName: uploadFileName || `${selectedReqForUpload.projectName}_Design.dwg`,
      fileType: uploadFileType,
      fileSize: uploadFileSize,
      deliverable: uploadDeliverableType,
      version: uploadVersion,
      submittedBy: selectedDesignerName,
      submittedDate: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Pending Head Review',
      notes: uploadNotes
    };

    // Add to submitted files list
    setUploadedFilesList([newSubmittal, ...uploadedFilesList]);

    // Update global request state: change status to 'Pending Review', add attachment & timeline event
    setRequests(prev => prev.map(r => {
      if (r.id === selectedReqForUpload.id) {
        const newAttachment = {
          name: newSubmittal.fileName,
          size: newSubmittal.fileSize,
          type: newSubmittal.fileType
        };
        const newHistory = [
          {
            title: `Design File Uploaded (${newSubmittal.version})`,
            time: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            desc: `${selectedDesignerName} uploaded ${newSubmittal.fileName} and submitted for Design Head review.`
          },
          ...(r.history || [])
        ];
        return {
          ...r,
          status: 'Pending Review',
          attachments: [newAttachment, ...(r.attachments || [])],
          history: newHistory
        };
      }
      return r;
    }));

    alert(`Successfully uploaded ${newSubmittal.fileName}! Status updated to 'Pending Head Review'.`);
    setUploadModalOpen(false);
    setSelectedReqForUpload(null);
  };

  // Handle Status Change (e.g. Start Work)
  const handleStartWork = (reqId) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'In Progress',
          history: [
            {
              title: 'Designer Started Work',
              time: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
              desc: `${selectedDesignerName} commenced drafting work on requirement.`
            },
            ...(r.history || [])
          ]
        };
      }
      return r;
    }));
  };

  // Handle Comment Submission
  const handleAddComment = (reqId) => {
    if (!newCommentText.trim()) return;

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const updatedComments = [
          ...(r.comments || []),
          {
            sender: selectedDesignerName,
            role: 'Design Team',
            text: newCommentText,
            time: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
          }
        ];
        return { ...r, comments: updatedComments };
      }
      return r;
    }));

    setNewCommentText('');
  };

  return (
    <div className="app-layout" style={{ fontFamily: 'var(--font-sans)', display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', width: '100vw' }}>
      
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ width: '270px', minWidth: '270px', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* Logo Header */}
        <div className="sidebar-logo" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#34328C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
            T
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
            { id: 'Requirements', label: 'Revision Requests', icon: <Inbox size={18} />, badge: metrics.totalAssigned },
            { id: 'Upload Submittals', label: 'Upload & Submit File', icon: <UploadCloud size={18} />, badge: null },
            { id: 'Review Queue', label: 'Waiting Head Review', icon: <Clock size={18} />, badge: metrics.pendingReview },
            { id: 'Head Revisions', label: 'Head Feedback & Revisions', icon: <AlertTriangle size={18} />, badge: metrics.revisionNeeded > 0 ? metrics.revisionNeeded : null },
            { id: 'File Manager', label: 'File Manager', icon: <FolderOpen size={18} />, badge: uploadedFilesList.length },
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
              {currentTab === 'Requirements' && 'Client Revision Requests & Head Assignments'}
              {currentTab === 'Upload Submittals' && 'Upload Design Files & Submit for Review'}
              {currentTab === 'Review Queue' && 'Submittals Awaiting Design Head Review'}
              {currentTab === 'Head Revisions' && 'Design Head Feedback & Revision Requests'}
              {currentTab === 'File Manager' && 'File Manager & Submittal History'}
              {currentTab === 'Tesco ERM' && 'Tesco ERM Integration & Enterprise Sync'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Tesco Structures Design Workspace &bull; Logged in as <strong style={{ color: '#1E3A8A' }}>Design Team ({selectedDesignerName})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Quick Upload Primary Action Button */}
            <button
              onClick={() => {
                const firstAvailable = designerRequests[0] || requests[0];
                if (firstAvailable) handleOpenUpload(firstAvailable);
                else alert('No active design requests available for upload.');
              }}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <UploadCloud size={16} />
              <span>Upload Design File</span>
            </button>

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
                      onClick={() => setTeamNotifications(teamNotifications.map(n => ({ ...n, read: true })))}
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
                          setTeamNotifications(teamNotifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
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
          
          {/* SEARCH & FILTERS BAR (Hidden on Upload Submittals tab) */}
          {currentTab !== 'Upload Submittals' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Search input */}
              <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search by Project Name, REQ ID, Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Status & Priority dropdowns */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Assigned">Assigned from Head</option>
                    <option value="In Progress">In Production</option>
                    <option value="Pending Review">Waiting Head Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Revision Requested">Revision Requested</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Priority:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}
                  >
                    <option value="All">All Priorities</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {currentTab === 'Dashboard' && (
            <div>
              {/* Summary Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                
                {/* Card 1: Assigned Design */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Design</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Inbox size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{metrics.totalAssigned}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Assigned requirements</span>
                    <span style={{ color: '#3730A3', fontWeight: 700 }}>{metrics.urgentCount} Urgent</span>
                  </div>
                </div>

                {/* Card 2: In Progress */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{metrics.inProgress}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Active drafting work</span>
                    <span style={{ color: '#1D4ED8', fontWeight: 700 }}>Drawing in progress</span>
                  </div>
                </div>

                {/* Card 3: Waiting for Review */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waiting for Review</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCheck size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{metrics.pendingReview}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Uploaded submittals</span>
                    <span style={{ color: '#D97706', fontWeight: 700 }}>Awaiting Head sign-off</span>
                  </div>
                </div>

                {/* Card 4: Completed Design */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Design</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{metrics.approved}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Approved submittals</span>
                    <span style={{ color: '#166534', fontWeight: 700 }}>Fully approved</span>
                  </div>
                </div>

              </div>

              {/* Main Split Content: Active Requirements & Recent Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Left: Active Requirements Table */}
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
                          <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 800, color: '#1E3A8A' }}>{req.id}</div>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>{req.projectName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{req.customerName}</div>
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
                                  onClick={() => setSelectedReqForDetail(req)}
                                  title="View Full Spec & Requirements"
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Specs
                                </button>
                                <button
                                  onClick={() => handleOpenUpload(req)}
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

                {/* Right: Upload Submittals Timeline & Queue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Card: Recent Submittals */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>Recent File Submittals</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {uploadedFilesList.slice(0, 4).map(sub => (
                        <div key={sub.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E3A8A' }}>{sub.fileName}</span>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.68rem', fontWeight: 700 }}>
                              {sub.version}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{sub.projectName} ({sub.deliverable})</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                            <span>Submitted: {sub.submittedDate}</span>
                            <span style={{ fontWeight: 700, color: sub.status.includes('Approved') ? '#166534' : '#D97706' }}>{sub.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        Client: {req.customerName} &bull; {req.projectType}
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

          {/* TAB 3: UPLOAD SUBMITTALS WORKSPACE */}
          {currentTab === 'Upload Submittals' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Design File Submittal Hub</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>Upload completed AutoCAD layout, 3D renders, or calculation sheets for Head Review</p>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Select Project Requirement */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Select Requirement / Project *
                  </label>
                  <select
                    required
                    value={selectedReqForUpload ? selectedReqForUpload.id : ''}
                    onChange={(e) => {
                      const found = requests.find(r => r.id === e.target.value);
                      if (found) {
                        setSelectedReqForUpload(found);
                        setUploadFileName(`${found.projectName.replace(/\s+/g, '_')}_Layout_${uploadVersion}.dwg`);
                      }
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                  >
                    <option value="">-- Choose Project Requirement --</option>
                    {designerRequests.map(r => (
                      <option key={r.id} value={r.id}>
                        [{r.id}] {r.projectName} - {r.service} ({r.priority} Priority)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReqForUpload && (
                  <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#334155' }}>
                    <div style={{ fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>Requirement Overview:</div>
                    <div>Client: <strong>{selectedReqForUpload.customerName}</strong></div>
                    <div>Required Scope: <strong>{selectedReqForUpload.service} ({selectedReqForUpload.requirement})</strong></div>
                    <div>Target Due Date: <strong>{selectedReqForUpload.dueDate}</strong></div>
                  </div>
                )}

                {/* Deliverable Type & Version */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Deliverable Category
                    </label>
                    <select
                      value={uploadDeliverableType}
                      onChange={(e) => setUploadDeliverableType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="2D GA Layout">2D GA Layout Drawing</option>
                      <option value="2D Shop Drawing">2D Shop & Detailing Drawing</option>
                      <option value="3D Exterior Render">3D Exterior Architectural Render</option>
                      <option value="Structural Calculation">STAAD Pro / Calculation Sheet</option>
                      <option value="BOQ & Material List">BOQ & Bill of Materials</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      File Format
                    </label>
                    <select
                      value={uploadFileType}
                      onChange={(e) => setUploadFileType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="AutoCAD">AutoCAD (.DWG)</option>
                      <option value="PDF">PDF Drawing Package (.PDF)</option>
                      <option value="3D Model">3D Model (.SKP / .FBX)</option>
                      <option value="STAAD">STAAD Pro (.STD)</option>
                      <option value="ZIP Archive">Zip Package (.ZIP)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Revision Tag
                    </label>
                    <select
                      value={uploadVersion}
                      onChange={(e) => setUploadVersion(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      <option value="v1.0">v1.0 (Initial Submittal)</option>
                      <option value="v1.1">v1.1 (Minor Correction)</option>
                      <option value="v2.0">v2.0 (Head Revision)</option>
                      <option value="v3.0">v3.0 (Final Approval)</option>
                    </select>
                  </div>
                </div>

                {/* Drag & Drop File Upload Component */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Upload CAD / Design Attachment *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept=".dwg,.dxf,.pdf,.skp,.std,.zip,.rar,.png,.jpg"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      border: '2px dashed #93C5FD', 
                      borderRadius: '12px', 
                      backgroundColor: selectedFileObj ? '#F0FDF4' : '#EFF6FF', 
                      borderColor: selectedFileObj ? '#86EFAC' : '#93C5FD',
                      padding: '24px', 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <UploadCloud size={32} color={selectedFileObj ? '#166534' : '#2563EB'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedFileObj ? '#166534' : '#1E3A8A' }}>
                      {selectedFileObj ? `Selected: ${selectedFileObj.name}` : 'Click to select CAD drawing file from your system'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                      Supports DWG, PDF, SKP, STD, ZIP up to 100MB
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      style={{ marginTop: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #2563EB', backgroundColor: '#FFFFFF', color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {selectedFileObj ? 'Change File' : 'Browse Files...'}
                    </button>
                  </div>
                </div>

                {/* Submittal File Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Submittal File Name
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="e.g. PEB_Warehouse_Structural_Layout_v1.0.dwg"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Engineer Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Notes & Technical Comments for Design Head
                  </label>
                  <textarea
                    rows={4}
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Include structural assumptions, member section details, grid reference, or notes for Design Head review..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('Dashboard')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={16} /> Submit to Design Head for Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: REVIEW QUEUE */}
          {currentTab === 'Review Queue' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Submittals Pending Head Review</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>Drawings uploaded by team waiting for Design Head sign-off</p>
              </div>

              <div className="table-wrapper">
                <table className="crm-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Project Name / ID</th>
                      <th style={{ padding: '12px' }}>Deliverable</th>
                      <th style={{ padding: '12px' }}>Uploaded File</th>
                      <th style={{ padding: '12px' }}>Version</th>
                      <th style={{ padding: '12px' }}>Designer</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Pending Review' || r.status === 'Under Review')).map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 800, color: '#1E3A8A' }}>{r.id}</div>
                          <div style={{ fontWeight: 700 }}>{r.projectName}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{r.service}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#2563EB' }}>
                          {r.attachments && r.attachments[0] ? r.attachments[0].name : `${r.projectName}_Layout.dwg`}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 700, fontSize: '0.72rem' }}>
                            v1.0
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{r.assignedDesigner}</td>
                        <td style={{ padding: '12px' }}>{renderStatusBadge(r.status)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedReqForDetail(r)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Track Review
                          </button>
                        </td>
                      </tr>
                    ))}
                    {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Pending Review' || r.status === 'Under Review')).length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                          No PEB drawings currently in review queue. Upload design files to trigger review.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HEAD REVISIONS */}
          {currentTab === 'Head Revisions' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Design Head Feedback & Revision Requests</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>PEB projects requiring drawing modifications based on Head comments</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head'))).map(r => (
                  <div key={r.id} style={{ border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 800, fontSize: '0.78rem' }}>
                          {r.id}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>{r.projectName}</h3>
                      </div>
                      {renderStatusBadge(r.status)}
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

                {requests.filter(r => r.projectType === 'PEB' && (r.status === 'Revision' || r.status === 'Revision Requested' || r.comments?.some(c => c.sender === 'Design Head'))).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <CheckCircle2 size={32} color="#166534" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>All clear! No pending revision requests from Design Head.</div>
                  </div>
                )}
              </div>
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
      {selectedReqForDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            
            <button
              onClick={() => setSelectedReqForDetail(null)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#E0E7FF', color: '#3730A3', fontWeight: 800, fontSize: '0.82rem' }}>
                {selectedReqForDetail.id}
              </span>
              {renderStatusBadge(selectedReqForDetail.status)}
              {renderPriorityBadge(selectedReqForDetail.priority)}
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{selectedReqForDetail.projectName}</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '20px' }}>
              Client: {selectedReqForDetail.customerName} &bull; Requested by Design Head
            </div>

            {/* Spec Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Drawing Scope & Service</div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{selectedReqForDetail.service}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Deliverable Format: <strong>{selectedReqForDetail.requirement}</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Target Due Date: <strong>{selectedReqForDetail.dueDate}</strong></div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Project Location & Lead</div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>{selectedReqForDetail.location || 'MIDC Chakan Industrial Zone'}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Lead Reference: <strong>{selectedReqForDetail.leadId}</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Assigned Designer: <strong>{selectedReqForDetail.assignedDesigner}</strong></div>
              </div>
            </div>

            {/* PEB Structural Details */}
            {selectedReqForDetail.pebDetails && (
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '10px' }}>Structural Specification Matrix</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem', color: '#1E40AF' }}>
                  <div>Span: <strong>{selectedReqForDetail.pebDetails.span}</strong></div>
                  <div>Length: <strong>{selectedReqForDetail.pebDetails.length}</strong></div>
                  <div>Width: <strong>{selectedReqForDetail.pebDetails.width}</strong></div>
                  <div>Clear Height: <strong>{selectedReqForDetail.pebDetails.height}</strong></div>
                  <div>Built-up Area: <strong>{selectedReqForDetail.pebDetails.builtUpArea}</strong></div>
                  <div>Roof System: <strong>{selectedReqForDetail.pebDetails.roofType}</strong></div>
                  {selectedReqForDetail.pebDetails.craneRequired && (
                    <div style={{ gridColumn: 'span 3' }}>Crane Specs: <strong>{selectedReqForDetail.pebDetails.craneRequired}</strong></div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments from Head */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Input Attachments & Reference Files</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {selectedReqForDetail.attachments?.map((att, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <Paperclip size={14} color="#2563EB" />
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{att.name}</span>
                    <span style={{ color: '#94A3B8' }}>({att.size})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation / Comments */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Comments & Review Notes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
                {selectedReqForDetail.comments?.map((c, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: c.sender === 'Design Head' ? '#FEF3C7' : '#F1F5F9', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                      <span>{c.sender} ({c.role})</span>
                      <span style={{ color: '#94A3B8' }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0F172A', marginTop: '4px' }}>{c.text}</div>
                  </div>
                ))}
              </div>

              {/* Add comment input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add note for Design Head..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
                <button
                  onClick={() => handleAddComment(selectedReqForDetail.id)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <button
                onClick={() => setSelectedReqForDetail(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600 }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const req = selectedReqForDetail;
                  setSelectedReqForDetail(null);
                  handleOpenUpload(req);
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UploadCloud size={16} /> Upload Design Drawing
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
