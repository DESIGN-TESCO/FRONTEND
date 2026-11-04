import React, { useState, useMemo, useEffect } from 'react';
import DesignTeamDashboard from './DesignTeamDashboard';
import TeamAccounts from './TeamAccounts';
import { notify, confirmDialog, promptDialog } from './notify';
import {
  LayoutDashboard,
  Inbox,
  FolderOpen,
  Users,
  FileText,
  Database,
  LogOut,
  BarChart2,
  Settings,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  Clock,
  Paperclip,
  MessageSquare,
  History,
  MapPin,
  TrendingUp,
  MoreVertical,
  CheckCircle2,
  AtSign,
  ShieldCheck,
  AlertTriangle,
  Send,
  UserPlus,
  Trash2,
  CheckSquare,
  Square,
  Building,
  Bell,
  Eye,
  EyeOff,
  Briefcase,
  Download,
  Share2,
  FileSpreadsheet,
  CalendarRange,
  Info,
  Sliders,
  RefreshCw,
  FolderSync,
  Save,
  Palette
} from 'lucide-react';
import {
  authApi, requestsApi, designersApi, boqsApi, submittalsApi, drawingsApi,
  documentsApi, revisionsApi, activitiesApi, notificationsApi, statsApi,
  filesApi, isAuthenticated, getUser,
} from './api/client';

// Seed data removed — all data now loads from the backend API.

const getLeadId = (r) => (r && r.leadId && r.leadId !== 'N/A') ? r.leadId : 'N/A';
// Request category — 'Sales Team' / 'Project Team'. Procurement-raised requests are
// Project Team by default; a stored requestFrom always wins.
const catOf = (r) => (r && r.requestFrom) ? r.requestFrom : (r && r.source === 'procurement' ? 'Project Team' : '');
const reqDateOf = (r) => (r && (r.createdAt ? String(r.createdAt).slice(0, 10) : '')) || '';

// Format a real timestamp as "31 Oct 2026, 1:17 PM" (falls back to any stored label).
const fmtDateTime = (iso, fallback = '') => {
  if (!iso) return fallback;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return fallback; }
};

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [requests, setRequests] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [submittalsList, setSubmittalsList] = useState([]);
  const [drawerProject, setDrawerProject] = useState(null);
  const [drawerProjectLoading, setDrawerProjectLoading] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('Requirements');
  const [selectedDesignerName, setSelectedDesignerName] = useState(null);

  // Expanded CRM States
  const [projectsList, setProjectsList] = useState([]);
  const [boqList, setBoqList] = useState([]);
  const [drawingsList, setDrawingsList] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [revisionsList, setRevisionsList] = useState([]);
  const [selectedBoqId, setSelectedBoqId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeProjectTab, setActiveProjectTab] = useState('Overview');
  const [selectedDrawingFolder, setSelectedDrawingFolder] = useState('All');
  const [selectedDocCategory, setSelectedDocCategory] = useState('All');

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterRequirement, setFilterRequirement] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDesigner, setFilterDesigner] = useState('All');
  const [filterSalesManager, setFilterSalesManager] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All');

  // Assign Designer Modal popup state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignModalRequest, setAssignModalRequest] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignEstHours, setAssignEstHours] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');
  const [assignNotes, setAssignNotes] = useState('');
  const [notifyDesignerCheckbox, setNotifyDesignerCheckbox] = useState(true);

  // Revision Modal popup state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionModalRequest, setRevisionModalRequest] = useState(null);
  const [revisionModalComments, setRevisionModalComments] = useState('');

  // Settings states
  const [settingsFullName, setSettingsFullName] = useState('Administrator');
  const [settingsEmail, setSettingsEmail] = useState('admin@studiopro.com');
  const [settingsRole, setSettingsRole] = useState('Lead Coordinator');
  const [settingsEmailAlerts, setSettingsEmailAlerts] = useState(true);
  const [settingsDesktopNotifications, setSettingsDesktopNotifications] = useState(true);
  const [settingsThemeMode, setSettingsThemeMode] = useState('StudioPro Navy (Default)');

  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('Design Head'); // 'Design Head' or 'Design Team'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Comment Form state
  const [newComment, setNewComment] = useState('');
  const [revisionComment, setRevisionComment] = useState('');

  // BOQ Material Builder states
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('M.S materials - type');
  const [newMatUnit, setNewMatUnit] = useState('rft');
  const [newMatPrice, setNewMatPrice] = useState('');
  const [newMatQty, setNewMatQty] = useState('');

  // Create BOQ states
  const [isCreateBoqFormOpen, setIsCreateBoqFormOpen] = useState(false);
  const [selectedLeadIdForBoq, setSelectedLeadIdForBoq] = useState('');
  const [selectedBoqEngineer, setSelectedBoqEngineer] = useState('Neha Roy');
  const [newBoqVersion, setNewBoqVersion] = useState('V1');
  const [newBoqStatus, setNewBoqStatus] = useState('Preparing');

  const handleGenerateBoq = async () => {
    if (!selectedLeadIdForBoq) {
      notify('Please select a Lead ID.');
      return;
    }
    const req = requests.find(r => r.id === selectedLeadIdForBoq);
    if (!req) return;
    
    // Parse values from pebDetails if they exist
    const isMeters = req.pebDetails?.length?.includes('meter') || req.pebDetails?.width?.includes('meter');
    const len = parseFloat(req.pebDetails?.length) || 120;
    const wid = parseFloat(req.pebDetails?.width) || 50;
    const hgt = parseFloat(req.pebDetails?.height) || 11;
    const cols = parseInt(req.pebDetails?.numColumns) || 4;
    const bays = parseInt(req.pebDetails?.numBays) || 4;
    const spacing = parseFloat(req.pebDetails?.baySpacing) || 30;
    
    const calculatedMaterials = [];

    // 1. M.S Pipes (M.S materials - type)
    const msPipesQty = cols * hgt * 2;
    calculatedMaterials.push({
      item: 'M.S Pipes',
      quantity: String(Math.round(msPipesQty)),
      unit: 'rft',
      price: '150',
      total: String(Math.round(msPipesQty * 150)),
      category: 'M.S materials - type'
    });

    // 2. M.S Tubes (M.S materials - type)
    const msTubesQty = bays * spacing * 4;
    calculatedMaterials.push({
      item: 'M.S Tubes',
      quantity: String(Math.round(msTubesQty)),
      unit: 'rft',
      price: '180',
      total: String(Math.round(msTubesQty * 180)),
      category: 'M.S materials - type'
    });

    // 3. Roofing Sheets (Sheets - type)
    const area = len * wid;
    const roofSheetName = req.pebDetails?.roofType || 'Single Skin Sheet';
    const roofSheetPrice = isMeters ? 450 : 45;
    calculatedMaterials.push({
      item: roofSheetName,
      quantity: String(Math.round(area)),
      unit: isMeters ? 'SqM' : 'SqFt',
      price: String(roofSheetPrice),
      total: String(Math.round(area * roofSheetPrice)),
      category: 'Sheets - type'
    });

    // 4. Wall Cladding panels (Sheets - type)
    const perimeterArea = (len * 2 + wid * 2) * hgt;
    const wallPanelName = req.pebDetails?.wallCladding || 'PUF Panel cladding';
    const wallPanelPrice = isMeters ? 500 : 50;
    calculatedMaterials.push({
      item: wallPanelName,
      quantity: String(Math.round(perimeterArea)),
      unit: isMeters ? 'SqM' : 'SqFt',
      price: String(wallPanelPrice),
      total: String(Math.round(perimeterArea * wallPanelPrice)),
      category: 'Sheets - type'
    });

    // 5. uPVC Gutter if requested (Accessories)
    if (req.pebDetails?.gutterProvision === 'Yes') {
      const gutterQty = len * 2;
      calculatedMaterials.push({
        item: 'uPVC Gutter',
        quantity: String(Math.round(gutterQty)),
        unit: 'rft',
        price: '85',
        total: String(Math.round(gutterQty * 85)),
        category: 'Accessories'
      });
    }

    // 6. Screws (Accessories)
    const screwsQty = Math.round(area * 1.5);
    calculatedMaterials.push({
      item: 'Screws',
      quantity: String(screwsQty),
      unit: 'Nos',
      price: '2',
      total: String(screwsQty * 2),
      category: 'Accessories'
    });

    // 7. Sealant (Accessories)
    const sealantQty = Math.round(area * 0.05);
    calculatedMaterials.push({
      item: 'Sealant',
      quantity: String(sealantQty),
      unit: 'Nos',
      price: '75',
      total: String(sealantQty * 75),
      category: 'Accessories'
    });

    // Calculate total cost
    const totalCostVal = calculatedMaterials.reduce((sum, m) => sum + parseFloat(m.total), 0);
    const formattedCost = `₹${totalCostVal.toLocaleString('en-IN')}`;

    const newBoq = {
      id: `BOQ-2026-00${boqList.length + 1}`,
      project: `${req.projectName} (${getLeadId(req)})`,
      projectType: req.projectType,
      engineer: selectedBoqEngineer,
      materialCount: calculatedMaterials.length,
      estimatedCost: formattedCost,
      version: newBoqVersion,
      status: newBoqStatus,
      materials: calculatedMaterials
    };
    
    try {
      const created = await boqsApi.create({ project: newBoq.project, projectType: newBoq.projectType, engineer: newBoq.engineer, version: newBoq.version, status: newBoq.status, materials: newBoq.materials, leadId: getLeadId(req) });
      setBoqList(prev => [created, ...prev]);
      setIsCreateBoqFormOpen(false);
      setSelectedBoqId(created.id);
    } catch (err) { notify(err.message || 'Could not create BOQ.'); }
  };

  // Design Requirement Form states
  const [isRequirementFormOpen, setIsRequirementFormOpen] = useState(false);
  const [reqFormTab, setReqFormTab] = useState('Site Dimensions');
  const [plotLength, setPlotLength] = useState('');
  const [plotWidth, setPlotWidth] = useState('');
  const [numBays, setNumBays] = useState(4);
  const [baySpacing, setBaySpacing] = useState('');
  const [numColumns, setNumColumns] = useState(4);
  const [columnHeight, setColumnHeight] = useState('');
  const [craneProvision, setCraneProvision] = useState('No');
  const [mezzanineFloor, setMezzanineFloor] = useState('No');
  const [soilType, setSoilType] = useState('Normal');
  const [groundLevel, setGroundLevel] = useState('Even');
  const [foundationReady, setFoundationReady] = useState('Yes');
  const [structureGrade, setStructureGrade] = useState('Standard');
  const [purlinType, setPurlinType] = useState('Z Purlin');
  const [windSpeed, setWindSpeed] = useState('');
  const [snowLoad, setSnowLoad] = useState('');
  const [roofingSheetType, setRoofingSheetType] = useState('Single Skin');
  const [roofingSheetThickness, setRoofingSheetThickness] = useState('0.50 mm');
  const [wallCladding, setWallCladding] = useState('PUF Panel');
  const [gutterProvision, setGutterProvision] = useState('No');

  useEffect(() => {
    if (selectedRequest) {
      setPlotLength(selectedRequest.pebDetails?.length || '150');
      setPlotWidth(selectedRequest.pebDetails?.width || '60');
      setNumBays(selectedRequest.pebDetails?.numBays || 4);
      setBaySpacing(selectedRequest.pebDetails?.baySpacing || '30');
      setNumColumns(selectedRequest.pebDetails?.numColumns || 4);
      setColumnHeight(selectedRequest.pebDetails?.height || '11');
      setCraneProvision(selectedRequest.pebDetails?.craneRequired || 'No');
      setMezzanineFloor(selectedRequest.pebDetails?.mezzanineRequired || 'No');
      setSoilType(selectedRequest.pebDetails?.soilType || 'Normal');
      setGroundLevel(selectedRequest.pebDetails?.groundLevel || 'Even');
      setFoundationReady(selectedRequest.pebDetails?.foundationReady || 'Yes');
      setStructureGrade(selectedRequest.pebDetails?.structureGrade || 'Standard');
      setPurlinType(selectedRequest.pebDetails?.purlinType || 'Z Purlin');
      setWindSpeed(selectedRequest.pebDetails?.windSpeed || '39');
      setSnowLoad(selectedRequest.pebDetails?.snowLoad || '0.5');
      setRoofingSheetType(selectedRequest.pebDetails?.roofType || 'Single Skin');
      setRoofingSheetThickness(selectedRequest.pebDetails?.roofThickness || '0.50 mm');
      setWallCladding(selectedRequest.pebDetails?.wallCladding || 'PUF Panel');
      setGutterProvision(selectedRequest.pebDetails?.gutterProvision || 'No');
    }
  }, [selectedRequest?.id]);

  // Auto-save form fields to local requests state database whenever they change
  useEffect(() => {
    if (!selectedRequest) return;
    const updatedDetails = {
      ...selectedRequest.pebDetails,
      length: plotLength,
      width: plotWidth,
      numBays: numBays,
      baySpacing: baySpacing,
      numColumns: numColumns,
      height: columnHeight,
      craneRequired: craneProvision,
      mezzanineRequired: mezzanineFloor,
      soilType: soilType,
      groundLevel: groundLevel,
      foundationReady: foundationReady,
      structureGrade: structureGrade,
      purlinType: purlinType,
      windSpeed: windSpeed,
      snowLoad: snowLoad,
      roofType: roofingSheetType,
      roofThickness: roofingSheetThickness,
      wallCladding: wallCladding,
      gutterProvision: gutterProvision,
      builtUpArea: `${(parseFloat(plotLength) || 0) * (parseFloat(plotWidth) || 0)} sq ft`
    };

    const detailsChanged = JSON.stringify(selectedRequest.pebDetails) !== JSON.stringify(updatedDetails);
    if (detailsChanged) {
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, pebDetails: updatedDetails } : r));
      setSelectedRequest(prev => ({ ...prev, pebDetails: updatedDetails }));
    }
  }, [
    plotLength, plotWidth, numBays, baySpacing, numColumns, columnHeight,
    craneProvision, mezzanineFloor, soilType, groundLevel, foundationReady,
    structureGrade, purlinType, windSpeed, snowLoad, roofingSheetType,
    roofingSheetThickness, wallCladding, gutterProvision, selectedRequest
  ]);

  const handleOpenRequirementForm = (request) => {
    setReqFormTab('Site Dimensions');
    setIsRequirementFormOpen(true);
  };

  const handleSaveRequirementForm = async () => {
    if (!selectedRequest) return;
    const updatedDetails = {
      ...selectedRequest.pebDetails,
      length: plotLength,
      width: plotWidth,
      numBays: numBays,
      baySpacing: baySpacing,
      numColumns: numColumns,
      height: columnHeight,
      craneRequired: craneProvision,
      mezzanineRequired: mezzanineFloor,
      soilType: soilType,
      groundLevel: groundLevel,
      foundationReady: foundationReady,
      structureGrade: structureGrade,
      purlinType: purlinType,
      windSpeed: windSpeed,
      snowLoad: snowLoad,
      roofType: roofingSheetType,
      roofThickness: roofingSheetThickness,
      wallCladding: wallCladding,
      gutterProvision: gutterProvision,
      builtUpArea: `${(parseFloat(plotLength) || 0) * (parseFloat(plotWidth) || 0)} sq ft`
    };
    try {
      const updated = await requestsApi.saveRequirement(selectedRequest.id, { pebDetails: updatedDetails });
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedRequest(updated);
      setIsRequirementFormOpen(false);
    } catch (err) { notify(err.message || 'Could not save requirement details.'); }
  };

  const handleUpdateMaterialQty = async (boqId, materialIndex, newQty) => {
    const b = boqList.find(x => x.id === boqId);
    if (!b) return;
    const updatedMaterials = b.materials.map((m, idx) => {
      if (idx !== materialIndex) return m;
      const qtyVal = parseFloat(newQty), priceVal = parseFloat(m.price);
      const total = (!isNaN(qtyVal) && !isNaN(priceVal)) ? (qtyVal * priceVal).toFixed(2) : '0';
      return { ...m, quantity: newQty, total };
    });
    const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
    setBoqList(prev => prev.map(x => x.id === boqId ? { ...x, materials: updatedMaterials, estimatedCost: `₹${sum.toLocaleString()}` } : x));
    try { await boqsApi.update(boqId, { materials: updatedMaterials }); } catch { /* keep UI */ }
  };

  const handleCreateMaterial = async (boqId) => {
    if (!newMatName.trim()) { notify('Please enter a material name.'); return; }
    const b = boqList.find(x => x.id === boqId);
    if (!b) return;
    const newMat = {
      item: newMatName, quantity: newMatQty || '0', unit: newMatUnit, price: newMatPrice || '0',
      total: ((parseFloat(newMatQty) || 0) * (parseFloat(newMatPrice) || 0)).toFixed(2), category: newMatCategory,
    };
    const updatedMaterials = [...b.materials, newMat];
    const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
    setBoqList(prev => prev.map(x => x.id === boqId ? { ...x, materials: updatedMaterials, estimatedCost: `₹${sum.toLocaleString()}` } : x));
    setNewMatName(''); setNewMatQty(''); setNewMatPrice('');
    try { await boqsApi.update(boqId, { materials: updatedMaterials }); } catch { /* keep UI */ }
  };

  const handleDeleteMaterial = async (boqId, materialIndex) => {
    const b = boqList.find(x => x.id === boqId);
    if (!b) return;
    const updatedMaterials = b.materials.filter((_, idx) => idx !== materialIndex);
    const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
    setBoqList(prev => prev.map(x => x.id === boqId ? { ...x, materials: updatedMaterials, estimatedCost: `₹${sum.toLocaleString()}` } : x));
    try { await boqsApi.update(boqId, { materials: updatedMaterials }); } catch { /* keep UI */ }
  };

  
  // Inline date editor state
  const [editingDateId, setEditingDateId] = useState(null);
  const handleBoqStatus = async (boqId, status) => {
    setBoqList(prev => prev.map(b => b.id === boqId ? { ...b, status } : b));
    try { await boqsApi.update(boqId, { status }); } catch (e) { notify(e.message || 'Could not update BOQ.'); return; }
    notify(status === 'Approved' ? 'BOQ approved.' : 'Sent back to the estimating engineer for correction.');
  };

  const handleDateChange = async (id, newDate) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, dueDate: newDate } : r));
    setProjectsList(prev => prev.map(r => r.id === id ? { ...r, dueDate: newDate } : r));
    if (selectedRequest && selectedRequest.id === id) setSelectedRequest(prev => prev ? { ...prev, dueDate: newDate } : null);
    try { await requestsApi.update(id, { dueDate: newDate }); } catch { /* keep UI */ }
  };

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const headNotifRef = React.useRef(null);

  // Pull full, live project details (from Procurement) for the open request.
  React.useEffect(() => {
    let cancelled = false;
    if (drawerOpen && selectedRequest && selectedRequest.id) {
      setDrawerProject(null); setDrawerProjectLoading(true);
      requestsApi.project(selectedRequest.id)
        .then(p => { if (!cancelled) setDrawerProject(p); })
        .catch(() => { if (!cancelled) setDrawerProject(null); })
        .finally(() => { if (!cancelled) setDrawerProjectLoading(false); });
    } else { setDrawerProject(null); }
    return () => { cancelled = true; };
  }, [drawerOpen, selectedRequest && selectedRequest.id]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (headNotifRef.current && !headNotifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Handle open drawer (used in table view & detailed view transition)
  const handleOpenDrawer = (request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
    setActiveDrawerTab('Requirements');
    
    const curMember = teamMembers.find(m => m._id === request.assignedUserId) || teamMembers.find(m => m.name === request.assignedDesigner);
    setAssigneeId(curMember ? curMember._id : '');
    setAssignDueDate(request.dueDate || '');
    setAssignEstHours(request.pebDetails?.timeline ? '24' : '16');
    setAssignPriority(request.priority || 'Medium');
    setAssignNotes('');
  };

  // Open the design request a notification points at, and mark it read.
  const handleOpenNotification = async (notif) => {
    try { const nid = notif._id || notif.id; if (nid) { await notificationsApi.markRead(nid); setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))); } } catch { /* ignore */ }
    setShowNotifications(false);
    const req = notif.requestId ? requests.find(r => r.id === notif.requestId) : null;
    if (req) { handleOpenDrawer(req); }
    else { setCurrentTab('Design Requests'); setFilterStatus('All'); setFilterDesigner('All'); }
  };

  const handleOpenAssignModal = (request) => {
    setAssignModalRequest(request);
    setIsAssignModalOpen(true);
    const curMember = teamMembers.find(m => m._id === request.assignedUserId) || teamMembers.find(m => m.name === request.assignedDesigner);
    setAssigneeId(curMember ? curMember._id : '');
    setAssignDueDate(request.dueDate || '');
    setAssignEstHours('24');
    setAssignPriority(request.priority || 'Medium');
    setAssignNotes('');
  };

  const handleAssignDesignerSubmit = async (e) => {
    e.preventDefault();
    const req = assignModalRequest || selectedRequest;
    if (!req || !assigneeId) { notify('Please select a team member.'); return; }
    const member = teamMembers.find(m => m._id === assigneeId);
    if (!member) { notify('Please select a valid team member.'); return; }
    try {
      await requestsApi.assign(req.id, { assigneeUserId: member._id, dueDate: assignDueDate, priority: assignPriority, estHours: assignEstHours, notes: assignNotes, notify: notifyDesignerCheckbox });
      await loadData();
      setIsAssignModalOpen(false);
      setAssignModalRequest(null);
      notify(`Success: Project successfully assigned to ${member.name}.`);
    } catch (err) { notify(err.message || 'Could not assign team member.'); }
  };

  const handleDirectAssignDesigner = async (requestId, value) => {
    try {
      await requestsApi.setDesigner(requestId, value ? { assigneeUserId: value } : { designerName: 'Unassigned' });
      await loadData();
      if (value) {
        const m = teamMembers.find(x => x._id === value);
        notify(`Success: ${requestId} successfully assigned to ${m ? m.name : 'the team member'}.`);
      } else { notify(`${requestId} set to Unassigned.`); }
    } catch (err) { notify(err.message || 'Could not update assignment.'); }
  };

  const updateRequestStatus = async (statusName, actionMessage, reqObj = null) => {
    const activeReq = reqObj || selectedRequest;
    if (!activeReq) return;
    try {
      await requestsApi.setStatus(activeReq.id, statusName, actionMessage);
      await loadData();
      if (statusName === 'Completed' || statusName === 'Approved') {
        notify(`Success: Design files for ${activeReq.projectName} (${activeReq.id}) have been automatically sent to ${activeReq.requestedBy}.`);
      }
    } catch (err) { notify(err.message || 'Could not update status.'); }
  };

  const handleApprove = async (r) => {
    const req = r || selectedRequest; if (!req) return;
    const ok = await confirmDialog({ title: 'Approve design', message: `Are you sure you want to approve the design for ${req.projectName || req.id}? The approved files will be sent to Procurement.`, confirmText: 'Approve' });
    if (!ok) return;
    try {
      await requestsApi.approve(req.id);
      await loadData();
      notify(`Design approved for ${req.projectName || req.id}. The approved files are now available to Procurement.`);
    } catch (e) { notify(e.message || 'Could not approve.'); }
  };
  const handleReject = async (r) => {
    const req = r || selectedRequest; if (!req) return;
    const reason = await promptDialog({ title: 'Reject design', message: 'Are you sure you want to reject this design? Enter the reason — the team member will see it.', confirmText: 'Reject', danger: true });
    if (reason === null) return;
    try { await requestsApi.reject(req.id, reason); await loadData(); notify('Design rejected.'); }
    catch (e) { notify(e.message || 'Could not reject.'); }
  };
  const handleRequestChanges = async (r) => {
    const req = r || selectedRequest; if (!req) return;
    const remarks = await promptDialog({ title: 'Request changes', message: 'What changes are required? The designer will see these remarks.', confirmText: 'Send back' });
    if (remarks === null) return;
    try { await requestsApi.requestChanges(req.id, remarks); await loadData(); notify('Sent back to the designer for changes.'); }
    catch (e) { notify(e.message || 'Could not request changes.'); }
  };

  const handleRequestRevisionSubmit = async (e) => {
    e.preventDefault();
    if (!revisionComment.trim() || !selectedRequest) return;
    const currentRevs = revisionsList.filter(r => r.project === selectedRequest.projectName);
    const newRevNumber = `Rev ${currentRevs.length + 1}`;
    try {
      await revisionsApi.create({
        project: selectedRequest.projectName, revNumber: newRevNumber,
        designer: selectedRequest.assignedDesigner || 'Unassigned', requestedBy: 'Design Head',
        requestId: selectedRequest.id,
        dueDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
        status: 'Pending', comments: revisionComment,
        oldVersion: 'Drawing_Current.dwg', newVersion: 'Awaiting Submittal',
        date: new Date().toISOString().split('T')[0],
      });
      await requestsApi.setStatus(selectedRequest.id, 'In Progress', `Revision Requested (${newRevNumber}): ${revisionComment}`);
      setRevisionComment('');
      await loadData();
      notify(`Success: Revision requested successfully for ${selectedRequest.projectName}.`);
    } catch (err) { notify(err.message || 'Could not request revision.'); }
  };

  const handleOpenRevisionModal = (req) => {
    setRevisionModalRequest(req);
    setRevisionModalComments('');
    setIsRevisionModalOpen(true);
  };

  const handleRevisionModalSubmit = async (e) => {
    e.preventDefault();
    if (!revisionModalComments.trim() || !revisionModalRequest) return;
    const currentRevs = revisionsList.filter(r => r.project === revisionModalRequest.projectName);
    const newRevNumber = `Rev ${currentRevs.length + 1}`;
    try {
      await revisionsApi.create({
        project: revisionModalRequest.projectName, revNumber: newRevNumber,
        designer: revisionModalRequest.assignedDesigner || 'Unassigned', requestedBy: 'Design Head',
        requestId: revisionModalRequest.id,
        dueDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
        status: 'Pending', comments: revisionModalComments,
        oldVersion: 'Drawing_Current.dwg', newVersion: 'Awaiting Submittal',
        date: new Date().toISOString().split('T')[0],
      });
      await requestsApi.setStatus(revisionModalRequest.id, 'In Progress', `Revision Requested (${newRevNumber}): ${revisionModalComments}`);
      await loadData();
      setIsRevisionModalOpen(false);
      setRevisionModalRequest(null);
      setRevisionModalComments('');
      notify(`Success: Revision requested successfully for ${revisionModalRequest.projectName}.`);
    } catch (err) { notify(err.message || 'Could not request revision.'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedRequest) return;
    try {
      const updated = await requestsApi.addComment(selectedRequest.id, { sender: 'Design Head', role: 'Manager', text: newComment });
      setNewComment('');
      setSelectedRequest(updated);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (err) { notify(err.message || 'Could not add comment.'); }
  };

  const resetFilters = () => {
    setSearchText('');
    setFilterType('All');
    setFilterRequirement('All');
    setFilterPriority('All');
    setFilterStatus('All');
    setFilterDesigner('All');
    setFilterSalesManager('All');
    setFilterDateRange('All');
  };

  // ─────────── Backend data loading ───────────
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = React.useCallback(async () => {
    setDataLoading(true); setLoadError('');
    try {
      const [reqs, dess, acts, boqs, draws, docs, revs, notifs, subs, usersRes] = await Promise.all([
        requestsApi.list(), designersApi.list(), activitiesApi.list(), boqsApi.list(),
        drawingsApi.list(), documentsApi.list(), revisionsApi.list(), notificationsApi.list('head'),
        submittalsApi.list().catch(() => []), authApi.listUsers().catch(() => ({ users: [] })),
      ]);
      const members = (usersRes && usersRes.users ? usersRes.users : []).filter(u => u.role === 'design_team' && u.isActive !== false);
      setTeamMembers(members); setSubmittalsList(Array.isArray(subs) ? subs : []);
      setRequests(reqs); setProjectsList(reqs.filter(r => r.status !== 'New'));
      setDesigners(dess); setActivities(acts); setBoqList(boqs);
      setDrawingsList(draws); setDocumentsList(docs); setRevisionsList(revs);
      setNotifications(notifs.map(n => ({ ...n, id: n._id || n.id })));
      setSelectedRequest(prev => prev ? (reqs.find(r => r.id === prev.id) || prev) : prev);
    } catch (e) { setLoadError(e.message || 'Could not load data.'); }
    finally { setDataLoading(false); }
  }, []);

  // Restore a saved session on refresh and load data from the backend.
  useEffect(() => {
    if (isAuthenticated()) {
      const u = getUser();
      setIsLoggedIn(true);
      if (u && u.role === 'design_team') setLoginRole('Design Team');
      if (u) { setSettingsFullName(u.name || ''); setSettingsEmail(u.email || ''); if (u.settings) { setSettingsRole(u.settings.systemRole || ''); setSettingsEmailAlerts(u.settings.emailAlerts !== false); setSettingsDesktopNotifications(u.settings.desktopNotifications !== false); if (u.settings.themeMode) setSettingsThemeMode(u.settings.themeMode); } }
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoginBusy(true);
    try {
      const { user } = await authApi.login(loginEmail, loginPassword, rememberMe);
      setIsLoggedIn(true);
      setLoginRole(user && user.role === 'design_team' ? 'Design Team' : 'Design Head');
      if (user) { setSettingsFullName(user.name || ''); setSettingsEmail(user.email || ''); }
      await loadData();
    } catch (err) { setLoginError(err.message || 'Login failed. Check your email and password.'); }
    finally { setLoginBusy(false); }
  };
  const doLogout = async () => {
    const ok = await confirmDialog({ title: 'Log out', message: 'Are you sure you want to log out?', confirmText: 'Log out', danger: true });
    if (!ok) return;
    authApi.logout(); setIsLoggedIn(false); setCurrentTab('Dashboard');
  };
  const handleDeleteDocument = async (doc) => {
    const ok = await confirmDialog({ title: 'Delete document', message: `Delete "${doc.name}"? This cannot be undone.`, confirmText: 'Delete', danger: true });
    if (!ok) return;
    try { await documentsApi.remove(doc.id || doc._id); const docs = await documentsApi.list(); setDocumentsList(docs); notify('Document deleted.'); }
    catch (e) { notify(e.message || 'Could not delete the document.'); }
  };
  const handleSaveSettings = async () => {
    try {
      await authApi.updateMe({ name: settingsFullName, settings: { systemRole: settingsRole, emailAlerts: settingsEmailAlerts, desktopNotifications: settingsDesktopNotifications, themeMode: settingsThemeMode } });
      notify('Configuration saved successfully!');
    } catch (err) { notify(err.message || 'Could not save settings.'); }
  };

  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', marginTop: '4px', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' };

  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  const [creatingReq, setCreatingReq] = useState(false);
  const blankReq = () => ({ requestFrom: '', customerName: '', projectName: '', projectType: 'PEB', service: '', requirement: '2D + 3D', priority: 'Medium', requestedBy: '', leadId: '', dueDate: '', location: '', budget: '', timeline: '' });
  const [newReq, setNewReq] = useState(blankReq());
  const [newReqFiles, setNewReqFiles] = useState([]);
  const setNR = (k, v) => setNewReq(prev => ({ ...prev, [k]: v }));
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newReq.projectName.trim() || !newReq.customerName.trim()) { notify('Enter the customer and project name.'); return; }
    if (!newReq.requestFrom) { notify('Select who the request is from (Sales Team or Project Team).'); return; }
    setCreatingReq(true);
    try {
      const created = await requestsApi.create({ ...newReq, assignedDesigner: 'Unassigned', status: 'New', deliverables: [],
        history: [{ title: 'Request created', time: new Date().toISOString().slice(0, 16).replace('T', ' '), desc: 'Created in Design CRM' }] });
      // Upload the attached documents and link them to the new request (stored in
      // design_files; the attachments live on the request so they follow it through
      // assignment, reassignment and every status, visible to the assigned member).
      if (created && created.id && newReqFiles.length) {
        for (const f of newReqFiles) {
          try {
            const up = await filesApi.upload(f, { entity: 'request', entityId: created.id, uploadedBy: settingsFullName || 'Design Head' });
            await requestsApi.addAttachment(created.id, { name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, type: f.type || '', fileId: up.fileId });
          } catch (e2) { notify(`Request created, but "${f.name}" could not be attached: ${e2.message}`); }
        }
      }
      setIsNewReqOpen(false); setNewReq(blankReq()); setNewReqFiles([]); await loadData();
    } catch (err) { notify(err.message || 'Could not create request.'); }
    finally { setCreatingReq(false); }
  };

  const [isAddDesignerOpen, setIsAddDesignerOpen] = useState(false);
  const [creatingDesigner, setCreatingDesigner] = useState(false);
  const [newDesigner, setNewDesigner] = useState({ name: '', role: '', experience: '', availability: 'Full-time' });
  const setND = (k, v) => setNewDesigner(prev => ({ ...prev, [k]: v }));
  const handleCreateDesigner = async (e) => {
    e.preventDefault();
    if (!newDesigner.name.trim()) { notify('Enter the designer name.'); return; }
    setCreatingDesigner(true);
    try {
      await designersApi.create({ ...newDesigner, status: 'Available', workload: 0, currentTasks: 0, availableCapacity: '40 hrs' });
      setIsAddDesignerOpen(false); setNewDesigner({ name: '', role: '', experience: '', availability: 'Full-time' }); await loadData();
    } catch (err) { notify(err.message || 'Could not add designer.'); }
    finally { setCreatingDesigner(false); }
  };

  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [docForm, setDocForm] = useState({ category: '2D Requirements', project: '', version: 'V1' });
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) { notify('Choose a file to upload.'); return; }
    setDocUploading(true);
    try {
      const up = await filesApi.upload(docFile, { entity: 'document' });
      await documentsApi.create({ name: docFile.name, category: docForm.category, project: docForm.project, uploadedBy: settingsFullName || 'Design Head', version: docForm.version, date: new Date().toISOString().split('T')[0], fileId: up.fileId });
      setIsDocUploadOpen(false); setDocFile(null); setDocForm({ category: '2D Requirements', project: '', version: 'V1' });
      const docs = await documentsApi.list(); setDocumentsList(docs);
    } catch (err) { notify(err.message || 'Upload failed.'); }
    finally { setDocUploading(false); }
  };

  const [isDwgUploadOpen, setIsDwgUploadOpen] = useState(false);
  const [dwgForm, setDwgForm] = useState({ folder: '2D Drawings', project: '', version: 'V1', designer: '' });
  const [dwgFile, setDwgFile] = useState(null);
  const [dwgUploading, setDwgUploading] = useState(false);
  const handleUploadDrawing = async (e) => {
    e.preventDefault();
    if (!dwgFile) { notify('Choose a file to upload.'); return; }
    setDwgUploading(true);
    try {
      const up = await filesApi.upload(dwgFile, { entity: 'drawing' });
      await drawingsApi.create({ name: dwgFile.name, folder: dwgForm.folder, project: dwgForm.project, version: dwgForm.version, designer: dwgForm.designer, date: new Date().toISOString().split('T')[0], fileId: up.fileId });
      setIsDwgUploadOpen(false); setDwgFile(null); setDwgForm({ folder: '2D Drawings', project: '', version: 'V1', designer: '' });
      const draws = await drawingsApi.list(); setDrawingsList(draws);
    } catch (err) { notify(err.message || 'Upload failed.'); }
    finally { setDwgUploading(false); }
  };

  // Filtered Requests Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = (searchText || '').toLowerCase();
      const matchSearch = !q ||
        (r.projectName || '').toLowerCase().includes(q) ||
        (getLeadId(r) || '').toLowerCase().includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.procurementProjectCode || '').toLowerCase().includes(q) ||
        (r.assignedDesigner || '').toLowerCase().includes(q) ||
        (catOf(r) || '').toLowerCase().includes(q) ||
        (r.requestedBy || '').toLowerCase().includes(q);
      const matchCategory = filterCategory === 'All' || catOf(r) === filterCategory;
      const matchDate = !filterDateFrom || reqDateOf(r) >= filterDateFrom;

      const matchType = filterType === 'All' || r.projectType === filterType;
      const matchReq = filterRequirement === 'All' || r.requirement === filterRequirement;
      const matchPriority = filterPriority === 'All' || r.priority === filterPriority;
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      const matchDesigner = filterDesigner === 'All' || r.assignedDesigner === filterDesigner;
      const matchSM = filterSalesManager === 'All' || (r.requestedBy || '').includes(filterSalesManager);

      return matchSearch && matchType && matchReq && matchPriority && matchStatus && matchDesigner && matchSM && matchCategory && matchDate;
    });
  }, [requests, searchText, filterType, filterRequirement, filterPriority, filterStatus, filterDesigner, filterSalesManager, filterCategory, filterDateFrom]);

  const getStatusBadge = (status) => {
    const styleMap = {
      'New': 'badge badge-new',
      'Assigned': 'badge badge-assigned',
      'In Progress': 'badge badge-inprogress',
      'Pending Review': 'badge badge-pendingreview',
      'Approved': 'badge badge-approved',
      'Completed': 'badge badge-completed'
    };
    return <span className={styleMap[status] || 'badge'}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styleMap = {
      'Urgent': 'badge badge-urgent',
      'High': 'badge badge-high',
      'Medium': 'badge badge-medium',
      'Normal': 'badge badge-normal',
      'Low': 'badge badge-low'
    };
    return <span className={styleMap[priority] || 'badge'}>{priority}</span>;
  };

  if (!isLoggedIn) {
    const ACCENT = '#4F46E5', ACCENT_DARK = '#4338CA', ACCENT_SHADOW = 'rgba(79,70,229,0.25)';
    const HERO_FROM = '#EEF2FF', HERO_TO = '#E0E7FF', HERO_BORDER = 'rgba(199,210,254,0.5)';
    const dLabel = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' };
    const dInput = { width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.875rem', color: '#0F172A', boxSizing: 'border-box', transition: 'border-color 0.2s' };
    const dFocus = (e) => (e.target.style.borderColor = ACCENT);
    const dBlur = (e) => (e.target.style.borderColor = '#CBD5E1');
    return (
      <div className="login-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', fontFamily: 'var(--font-sans)' }}>
        <style>{`
          @media (min-width: 1024px) {
            .login-page-wrapper { height: 100vh !important; min-height: 100vh !important; overflow: hidden !important; }
            .login-container { padding: 1rem 1.5rem !important; max-height: calc(100vh - 60px) !important; }
            .login-grid { gap: 2.5rem !important; }
            .left-hero-card { padding: 1.75rem 2.25rem !important; gap: 1.15rem !important; }
            .hero-title { font-size: 2rem !important; }
            .hero-image-container { aspect-ratio: 1.45 !important; max-height: 280px !important; }
            .right-login-card { padding: 2rem !important; }
          }
        `}</style>

        <div className="login-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', width: '100%', alignItems: 'center' }}>

            {/* Left hero */}
            <div className="left-hero-card" style={{ background: `linear-gradient(135deg, ${HERO_FROM} 0%, ${HERO_TO} 100%)`, border: `1px solid ${HERO_BORDER}`, borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 20px -2px rgba(199,210,254,0.35)' }}>
              <img src="/tescologo-wordmark.png" alt="Tesco Structures" style={{ height: 44, width: 'auto', maxWidth: '250px', objectFit: 'contain', display: 'block', alignSelf: 'flex-start', marginLeft: -6 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h1 className="hero-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.2, letterSpacing: '-1px', margin: 0 }}>Design, Delivered<br />with Precision</h1>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>Receive design requests, assign tasks to your team, submit drawings and track approvals &mdash; one clear workspace from request to released design.</p>
              </div>
              <div className="hero-image-container" style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 30px -5px rgba(30,27,75,0.15)', border: '1px solid rgba(255,255,255,0.8)', aspectRatio: '1.45', backgroundColor: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 600 }}>Design Workspace</span>
                <img src="/structural_background.png" alt="Design workspace preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'relative' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                {['Design Requests', 'Task Assignment', 'Drawing Submittals', 'Head Approvals', 'Revision Tracking'].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#1E1B4B' }}>
                    <CheckCircle2 size={16} color={ACCENT} fill={HERO_TO} /><span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right login card */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <div className="right-login-card" style={{ width: '100%', maxWidth: '460px', backgroundColor: '#FFFFFF', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Welcome Back &#128075;</h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Sign in to continue to the Design portal.</p>
                </div>
                {loginError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>{loginError}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={dLabel}>Role</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', cursor: 'pointer' }} onFocus={dFocus} onBlur={dBlur}>
                        <option value="Design Head">Design Head</option>
                        <option value="Design Team">Design Team</option>
                      </select>
                      <ShieldCheck size={16} color={ACCENT} style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={dLabel}>Email / Employee ID</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input required type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="e.g. name@company.com" autoComplete="username" style={dInput} onFocus={dFocus} onBlur={dBlur} />
                      <AtSign size={16} color="#94A3B8" style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={dLabel}>Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input required type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" style={dInput} onFocus={dFocus} onBlur={dBlur} />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }} aria-label="Toggle password">
                        {showLoginPassword ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748B' }}>
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: ACCENT }} />
                      Remember Me
                    </label>
                  </div>
                  <button type="submit" disabled={loginBusy || !loginEmail || !loginPassword} style={{ backgroundColor: ACCENT, color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', padding: '0.875rem', fontWeight: 700, fontSize: '0.875rem', cursor: (loginBusy || !loginEmail || !loginPassword) ? 'not-allowed' : 'pointer', boxShadow: `0 4px 12px ${ACCENT_SHADOW}`, marginTop: '0.25rem', opacity: (loginBusy || !loginEmail || !loginPassword) ? 0.55 : 1, transition: 'background-color 0.2s' }} onMouseEnter={(e) => { if (!(loginBusy || !loginEmail || !loginPassword)) e.currentTarget.style.backgroundColor = ACCENT_DARK; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ACCENT; }}>{loginBusy ? 'Signing in…' : 'Login to Dashboard'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0', padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', width: '100%', fontSize: '0.75rem', color: '#64748B', flexWrap: 'wrap', gap: '1rem' }}>
            <span>&copy; {new Date().getFullYear()} Tesco Structures &middot; Design Portal. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 500 }}>
              <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#security" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loginRole === 'Design Team') {
    return (
      <DesignTeamDashboard
        requests={requests}
        setRequests={setRequests}
        designers={designers}
        setDesigners={setDesigners}
        onLogout={doLogout}
        loginEmail={loginEmail}
      />
    );
  }

  return (
    <div className="app-layout" style={{ fontFamily: 'var(--font-sans)', display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar" style={{ width: '260px', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div className="sidebar-logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src="/tescologo.png" alt="Tesco Structures" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>Tesco Structures</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Design Management</div>
          </div>
        </div>

        <ul className="sidebar-menu" style={{ listStyle: 'none', padding: '16px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {[
            { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'Design Requests', label: 'Design Requests', icon: <Inbox size={18} /> },
            { id: 'Design Team', label: 'Design Team', icon: <Users size={18} /> },
            { id: 'Review Queue', label: 'Pending Approvals', icon: <CheckSquare size={18} /> },
            { id: 'Documents', label: 'Documents', icon: <FileText size={18} /> },
            { id: 'Notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'Team Accounts', label: 'Team Accounts', icon: <UserPlus size={18} /> }
          ].map(item => (
            <li key={item.id}>
              <div
                className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSelectedProjectId(null);
                  setSelectedBoqId(null);
                  if (item.id === 'Design Team') {
                    setSelectedDesignerName(null);
                  }
                  if (item.id === 'Design Requests') {
                    setFilterStatus('All'); setFilterDesigner('All'); setFilterType('All');
                    setFilterRequirement('All'); setFilterPriority('All'); setFilterSalesManager('All'); setSearchText(''); setFilterCategory('All'); setFilterDateFrom('');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s',
                  backgroundColor: currentTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: currentTab === item.id ? '#FFFFFF' : 'rgba(255,255,255,0.8)'
                }}
              >
                {item.icon}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              </div>
            </li>
          ))}
        </ul>

         {/* Profile Card in Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: loginRole === 'Design Head' ? '#5C6AC4' : '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
              {loginRole === 'Design Head' ? 'DH' : 'DT'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loginRole}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span>Tesco Structures</span>
              </div>
            </div>
            <button
              onClick={doLogout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                color: '#F87171',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="main-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* HEADER */}
        <header className="header" style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div className="header-title-container">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{currentTab}</h1>
          </div>
          
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Global Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Global Search requests..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (currentTab !== 'Design Requests' && currentTab !== 'Dashboard' && currentTab !== 'Projects') {
                    setCurrentTab('Design Requests');
                  }
                }}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            {/* Notification Widget */}
            <div ref={headNotifRef} style={{ position: 'relative' }}>
              <button
                className="action-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-secondary)' }}
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '0px', right: '0px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', backgroundColor: 'var(--danger)', color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{notifications.filter(n => !n.read).length}</span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="notification-dropdown" style={{ position: 'absolute', top: '45px', right: 0, width: '320px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h3>
                  <button
                    className="btn-reset"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}
                    onClick={() => { notificationsApi.markAllRead('head'); setNotifications(notifications.map(n => ({ ...n, read: true }))); }}
                  >
                    Mark all read
                  </button>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.length === 0 && (
                    <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No notifications yet.</div>
                  )}
                  {notifications.map(notif => (
                    <div key={notif.id} onClick={() => handleOpenNotification(notif)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: !notif.read ? '#F8FAFC' : 'transparent', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1E293B' }}>{notif.title}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{notif.message || notif.desc}</p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{fmtDateTime(notif.createdAt, notif.time)}{notif.category ? ' \u2022 ' + notif.category : ''}{notif.requestId ? ' \u2022 ' + notif.requestId : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* DYNAMIC VIEW CONTAINER */}
        <main className="content-container" style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
          
          {/* TAB 1: ENTERPRISE DASHBOARD VIEW (UNCHANGED) */}
          {currentTab === 'Dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto' }}>
              {/* ROW 1: KPI CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { title: 'New Design Requests', value: requests.filter(r => r.status === 'New').length, icon: <Inbox size={20} />, trend: 'Awaiting triage', desc: 'From sales team', color: '#2B2E83', bg: '#EEF2F6', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('New'); setFilterDesigner('All'); } },
                  { title: 'Pending Assignment', value: requests.filter(r => r.assignedDesigner === 'Unassigned').length, icon: <UserPlus size={20} />, trend: 'Allocating', desc: 'Needs designer', color: '#F59E0B', bg: '#FEF3C7', onClick: () => { setCurrentTab('Design Requests'); setFilterDesigner('Unassigned'); setFilterStatus('All'); } },
                  { title: 'Active Projects', value: requests.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length, icon: <Clock size={20} />, trend: 'Active drawing', desc: 'In production', color: '#5C6AC4', bg: '#E0E7FF', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('In Progress'); setFilterDesigner('All'); } },
                  { title: 'Pending Review', value: requests.filter(r => ['Submitted for Approval','Resubmitted','Pending Review'].includes(r.status)).length, icon: <AlertTriangle size={20} />, trend: 'Needs approval', desc: 'Drawing submittals', color: '#8B5CF6', bg: '#F3E8FF', onClick: () => { setCurrentTab('Review Queue'); } },
                  { title: 'Client Revisions', value: revisionsList.filter(r => r.status === 'Pending' || r.status === 'Urgent').length, icon: <MessageSquare size={20} />, trend: 'Active cycles', desc: 'Review adjustments', color: '#EF4444', bg: '#FEE2E2', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('In Progress'); setFilterDesigner('All'); } },
                  { title: 'Overdue Tasks', value: requests.filter(r => ['Assigned', 'In Progress'].includes(r.status) && r.dueDate && new Date(r.dueDate) < new Date()).length, icon: <AlertCircle size={20} />, trend: 'Overdue SLA', desc: 'Requires attention', color: '#B91C1C', bg: '#FEE2E2', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('In Progress'); setFilterDesigner('All'); } },
                  { title: 'Completed This Week', value: requests.filter(r => r.status === 'Completed' || r.status === 'Approved').length, icon: <CheckCircle2 size={20} />, trend: 'This week', desc: 'Ready for site', color: '#22C55E', bg: '#DCFCE7', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('Completed'); setFilterDesigner('All'); } }
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.2' }}>{kpi.title}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kpi.icon}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>{kpi.value}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.65rem' }}>
                        <span style={{ color: kpi.color, fontWeight: 600 }}>{kpi.trend}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{kpi.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ROW 2: APPROVAL QUEUE */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Request & Assign Task</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requests.filter(r => ['Submitted for Approval','Resubmitted','Pending Review'].includes(r.status)).map(r => (
                    <div 
                      key={r.id} 
                      style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onClick={() => handleOpenDrawer(r)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{r.id}</span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{r.projectName}</div>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{r.projectType}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {r.projectManager ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project Manager: <strong>{r.projectManager}</strong></span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sales Manager: <strong>{r.salesManager || r.requestedBy?.replace(' (Sales Manager)', '') || 'Ritesh Deshmukh'}</strong></span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          Assigned: 
                          <select 
                            value={(teamMembers.find(m => m._id === r.assignedUserId) ? r.assignedUserId : '')} 
                            onChange={(e) => handleDirectAssignDesigner(r.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              marginLeft: '6px', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#1E293B',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">{r.assignedDesigner && r.assignedDesigner !== 'Unassigned' && !teamMembers.find(m => m._id === r.assignedUserId) ? `${r.assignedDesigner} (unlinked)` : 'Unassigned'}</option>
                            {teamMembers.map(m => (
                              <option key={m._id} value={m._id}>{m.name}{m.designation ? ` — ${m.designation}` : ''}</option>
                            ))}
                          </select>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {r.dueDate}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="badge badge-completed" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); handleApprove(r); }}>Approve</button>
                          <button className="badge badge-urgent" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); handleReject(r); }}>Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.filter(r => ['Submitted for Approval','Resubmitted','Pending Review'].includes(r.status)).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No drawing submittals waiting approval.</div>
                  )}
                </div>
              </div>

              {/* ROW 3: PRIORITY TASKS TABLE */}
              <div className="table-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>Priority Design Tasks & Submittals</h3>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setCurrentTab('Design Requests')}>View All Requests</button>
                </div>
                <div className="table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Project Type</th>
                        <th>Lead ID</th>
                        <th>Design Type</th>
                        <th>Assigned by</th>
                        <th>Assigned Designer</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDrawer(r)}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                          <td>
                            <div className="project-meta-cell">
                              <span className="project-name-text" style={{ fontSize: '0.85rem' }}>{r.projectType}</span>
                            </div>
                          </td>
                          <td style={{ color: '#4F46E5', fontWeight: 600 }}>{getLeadId(r)}</td>
                          <td>
                            <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: r.projectType === 'PEB' ? '#edf5ff' : '#ecfdf5', color: r.projectType === 'PEB' ? '#0f62fe' : '#059669' }}>
                              {r.projectType}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', color: '#1E293B' }}>
                              {r.projectManager ? (
                                <span>PM: <strong>{r.projectManager}</strong></span>
                              ) : (
                                <span>SM: <strong>{r.salesManager || r.requestedBy?.replace(' (Sales Manager)', '') || 'Ritesh Deshmukh'}</strong></span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 550 }}>{r.assignedDesigner}</span>
                              {r.assignedDesigner === 'Unassigned' && (
                                <button className="btn-icon-only" style={{ padding: '2px' }} onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(r); }} title="Assign Designer">
                                  <UserPlus size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            {editingDateId === r.id ? (
                              <input
                                type="date"
                                value={r.dueDate || ''}
                                onChange={(e) => handleDateChange(r.id, e.target.value)}
                                onBlur={() => setEditingDateId(null)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                style={{ padding: '4px 8px', fontSize: '0.85rem', border: '1px solid var(--primary)', borderRadius: '4px', outline: 'none', fontFamily: 'inherit', backgroundColor: '#FFFFFF', color: 'var(--text-main)' }}
                              />
                            ) : (
                              <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setEditingDateId(r.id); }} title="Click to change date">
                                <span style={{ borderBottom: '1px dashed var(--text-muted)' }}>{r.dueDate}</span>
                              </div>
                            )}
                          </td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button className="btn-icon-only" title="View Details" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(r); }}><Eye size={12} /></button>
                              <button className="btn-icon-only" title="Comments" onClick={(e) => { e.stopPropagation(); setSelectedRequest(r); setDrawerOpen(true); setActiveDrawerTab('Comments'); }}><MessageSquare size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


              {/* ROW 6: DEPARTMENT ACTIVITIES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={16} />
                    <span>Recent Department Activity</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                    {activities.map(act => (
                      <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EEF2F6', color: '#34328C', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                          {act.user.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#1E293B' }}>
                            <strong>{act.user}</strong> {act.action} <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{act.target}</span>
                          </p>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{fmtDateTime(act.createdAt, act.time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESIGN REQUESTS */}
          {currentTab === 'Design Requests' && (
            <div>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { title: 'New Requests', val: requests.filter(r => r.status === 'New').length, color: '#2B2E83' },
                  { title: 'Pending Assign', val: requests.filter(r => r.assignedDesigner === 'Unassigned').length, color: '#F59E0B' },
                  { title: 'In Progress', val: requests.filter(r => r.status === 'In Progress').length, color: '#5C6AC4' },
                  { title: 'Waiting Review', val: requests.filter(r => ['Submitted for Approval','Resubmitted','Pending Review'].includes(r.status)).length, color: '#8B5CF6' },
                  { title: 'Revision', val: revisionsList.filter(r => r.status === 'Pending' || r.status === 'Urgent').length, color: '#EF4444' },
                  { title: 'Completed', val: requests.filter(r => r.status === 'Completed' || r.status === 'Approved').length, color: '#22C55E' }
                ].map((s, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.val}</div>
                  </div>
                ))}
              </div>



              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Request From:</span>
                {['All', 'Sales Team', 'Project Team'].map(c => (
                  <button key={c} type="button" onClick={() => setFilterCategory(c)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid ' + (filterCategory === c ? 'var(--primary)' : 'var(--border-color)'), backgroundColor: filterCategory === c ? 'var(--primary)' : '#FFFFFF', color: filterCategory === c ? '#FFFFFF' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>{c}</button>
                ))}
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#1E293B' }}>
                  {['All', 'New', 'Assigned', 'In Progress', 'Submitted for Approval', 'Resubmitted', 'Changes Requested', 'Approved', 'Rejected'].map(o => <option key={o} value={o}>{o === 'All' ? 'All statuses' : o}</option>)}
                </select>
                <select value={filterDesigner} onChange={(e) => setFilterDesigner(e.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#1E293B' }}>
                  <option value="All">All members</option>
                  <option value="Unassigned">Unassigned</option>
                  {teamMembers.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                </select>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>From<input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} /></label>
                {(filterCategory !== 'All' || filterStatus !== 'All' || filterDesigner !== 'All' || filterDateFrom) && (
                  <button type="button" onClick={() => { setFilterCategory('All'); setFilterStatus('All'); setFilterDesigner('All'); setFilterDateFrom(''); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #FECACA', backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                )}
                <button className="btn-primary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setIsNewReqOpen(true)}><UserPlus size={16} /> New Request</button>
              </div>

              {isNewReqOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setIsNewReqOpen(false)}>
                  <form onClick={(e) => e.stopPropagation()} onSubmit={handleCreateRequest} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '620px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>New Design Request</h3>
                      <button type="button" onClick={() => setIsNewReqOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Request From *
                        <select style={fieldStyle} value={newReq.requestFrom} onChange={(e) => setNR('requestFrom', e.target.value)}>
                          <option value="">Select…</option>
                          <option value="Sales Team">Sales Team</option>
                          <option value="Project Team">Project Team</option>
                        </select>
                      </label>
                      <label style={labelStyle}>Customer Name *<input style={fieldStyle} value={newReq.customerName} onChange={(e) => setNR('customerName', e.target.value)} /></label>
                      <label style={labelStyle}>Project Name *<input style={fieldStyle} value={newReq.projectName} onChange={(e) => setNR('projectName', e.target.value)} /></label>
                      <label style={labelStyle}>Project Type<select style={fieldStyle} value={newReq.projectType} onChange={(e) => setNR('projectType', e.target.value)}>{['PEB', 'Mangalore Tile Roofing', 'Glass Roofing', 'Other'].map(o => <option key={o}>{o}</option>)}</select></label>
                      <label style={labelStyle}>Design Type<select style={fieldStyle} value={newReq.requirement} onChange={(e) => setNR('requirement', e.target.value)}>{['2D + 3D', '2D Drawing', '3D Render', 'BOQ', '2D Layout + 3D Model', '2D Layouts + BOQ'].map(o => <option key={o}>{o}</option>)}</select></label>
                      <label style={labelStyle}>Service / Scope<input style={fieldStyle} value={newReq.service} onChange={(e) => setNR('service', e.target.value)} /></label>
                      <label style={labelStyle}>Priority<select style={fieldStyle} value={newReq.priority} onChange={(e) => setNR('priority', e.target.value)}>{['Urgent', 'High', 'Medium', 'Normal', 'Low'].map(o => <option key={o}>{o}</option>)}</select></label>
                      <label style={labelStyle}>Requested By<input style={fieldStyle} placeholder="Name (Role)" value={newReq.requestedBy} onChange={(e) => setNR('requestedBy', e.target.value)} /></label>
                      <label style={labelStyle}>Lead ID<input style={fieldStyle} placeholder="LD-1001" value={newReq.leadId} onChange={(e) => setNR('leadId', e.target.value)} /></label>
                      <label style={labelStyle}>Due Date<input type="date" style={fieldStyle} value={newReq.dueDate} onChange={(e) => setNR('dueDate', e.target.value)} /></label>
                      <label style={labelStyle}>Location<input style={fieldStyle} value={newReq.location} onChange={(e) => setNR('location', e.target.value)} /></label>
                      <label style={labelStyle}>Budget<input style={fieldStyle} placeholder="$48,000" value={newReq.budget} onChange={(e) => setNR('budget', e.target.value)} /></label>
                      <label style={labelStyle}>Timeline<input style={fieldStyle} placeholder="3 Weeks" value={newReq.timeline} onChange={(e) => setNR('timeline', e.target.value)} /></label>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attachments / Documents</span>
                        <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                          <FileText size={14} /> Choose Files
                          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf,.zip" style={{ display: 'none' }} onChange={(e) => { const picked = Array.from(e.target.files || []); e.target.value = ''; if (picked.length) setNewReqFiles(prev => [...prev, ...picked]); }} />
                        </label>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PDF, Word, Excel, JPG, PNG, DWG and more. Uploaded with the request and shared with the assigned team member.</span>
                        {newReqFiles.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                            {newReqFiles.map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', background: '#F8FAFC' }}>
                                <FileText size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                                <button type="button" className="btn-reset" style={{ color: '#DC2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => setNewReqFiles(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                      <button type="button" className="btn-secondary" onClick={() => { setIsNewReqOpen(false); setNewReqFiles([]); }}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={creatingReq}>{creatingReq ? 'Creating…' : 'Create Request'}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Large searchable table */}
              <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Project / Client</th>
                        <th>Lead ID</th>
                        <th>Project Type</th>
                        <th>Design Type</th>
                        <th>Requested By</th>
                        <th>Request From</th>
                        <th>Assigned Designer</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDrawer(r)}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                          <td><div style={{ fontWeight: 700, color: '#1E293B' }}>{r.projectName || '—'}</div>{r.customerName ? <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.customerName}</div> : null}</td>
                          <td style={{ color: '#4F46E5', fontWeight: 600 }}>{getLeadId(r)}</td>
                          <td style={{ fontWeight: 600 }}>{r.projectType}</td>
                          <td>
                            <span className="badge badge-new" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                              {r.requirement === '2D Drawing' ? '2D' : r.requirement === '3D Render' ? '3D' : r.requirement}
                            </span>
                          </td>
                          <td>{r.requestedBy}</td>
                          <td>{catOf(r) ? <span className="badge" style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: catOf(r) === 'Sales Team' ? '#E0E7FF' : '#DCFCE7', color: catOf(r) === 'Sales Team' ? '#3730A3' : '#166534' }}>{catOf(r)}</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem' }}>{r.assignedDesigner}</span>
                              {r.assignedDesigner === 'Unassigned' && (
                                <button className="btn-icon-only" style={{ padding: '2px' }} onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(r); }} title="Assign Designer">
                                  <UserPlus size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td>{getPriorityBadge(r.priority)}</td>
                          <td>{r.dueDate}</td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); handleOpenDrawer(r); }}>View</button>
                              {['Submitted for Approval', 'Resubmitted', 'Pending Review'].includes(r.status) && (<>
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: 'var(--success-light)', color: 'var(--success)' }} onClick={(e) => { e.stopPropagation(); handleApprove(r); }}>Approve</button>
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }} onClick={(e) => { e.stopPropagation(); handleRequestChanges(r); }}>Request Changes</button>
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: '#FEE2E2', color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleReject(r); }}>Reject</button>
                              </>)}
                              {['New', 'New Request', 'Assigned', 'In Progress', 'Rejected'].includes(r.status) && (
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(r); }}>{['Assigned', 'In Progress'].includes(r.status) ? 'Reassign' : 'Assign'}</button>
                              )}
                              {['Changes Requested', 'Rework Required', 'Revision Requested'].includes(r.status) && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#B45309' }}>Awaiting resubmission</span>}
                              {['Approved', 'Completed'].includes(r.status) && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)' }}>✓ Approved</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* TAB 4: BOQ MANAGEMENT */}
          {currentTab === 'BOQ Management' && (
            <div>
              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { title: 'Pending', val: 1, color: '#F59E0B' },
                  { title: 'Preparing', val: boqList.filter(b => b.status === 'Preparing').length, color: '#3B82F6' },
                  { title: 'Waiting Approval', val: boqList.filter(b => b.status === 'Waiting Approval').length, color: '#8B5CF6' },
                  { title: 'Approved', val: boqList.filter(b => b.status === 'Approved').length, color: '#22C55E' },
                  { title: 'Completed', val: 1, color: '#1E293B' }
                ].map((c, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: c.color, marginTop: '4px' }}>{c.val}</div>
                  </div>
                ))}
              </div>

              {selectedBoqId ? (
                (() => {
                  const boq = boqList.find(b => b.id === selectedBoqId);
                  if (!boq) return <p>BOQ not found</p>;
                  return (
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <div>
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', marginBottom: '8px' }} onClick={() => setSelectedBoqId(null)}>&larr; Back to BOQs</button>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{boq.project} - material specifications</h3>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{boq.status}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          {/* CATEGORY 1: M.S materials - type */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', borderBottom: '2px solid var(--primary-light)', paddingBottom: '4px' }}>1. M.S materials - type</h4>
                            <table className="crm-table">
                              <thead>
                                <tr>
                                  <th>Item Specification</th>
                                  <th style={{ width: '150px' }}>Quantity Required</th>
                                  <th>Unit</th>
                                  <th>Price / Unit</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                  <th style={{ width: '40px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {boq.materials.map((m, index) => ({ m, index })).filter(({ m }) => m.category === 'M.S materials - type').map(({ m, index }) => (
                                  <tr key={index}>
                                    <td style={{ fontWeight: 600 }}>{m.item}</td>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={m.quantity} 
                                        onChange={(e) => handleUpdateMaterialQty(boq.id, index, e.target.value)} 
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} 
                                      />
                                    </td>
                                    <td>{m.unit || 'rft'}</td>
                                    <td>₹{m.price}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(m.total).toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>
                                      <button className="btn-icon-only" style={{ color: 'var(--danger)', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} onClick={() => handleDeleteMaterial(boq.id, index)} title="Delete material">
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {boq.materials.filter(m => m.category === 'M.S materials - type').length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px' }}>No M.S materials added yet.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* CATEGORY 2: Sheets - type */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', borderBottom: '2px solid var(--primary-light)', paddingBottom: '4px' }}>2. Sheets - type</h4>
                            <table className="crm-table">
                              <thead>
                                <tr>
                                  <th>Item Specification</th>
                                  <th style={{ width: '150px' }}>Quantity Required</th>
                                  <th>Unit</th>
                                  <th>Price / Unit</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                  <th style={{ width: '40px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {boq.materials.map((m, index) => ({ m, index })).filter(({ m }) => m.category === 'Sheets - type').map(({ m, index }) => (
                                  <tr key={index}>
                                    <td style={{ fontWeight: 600 }}>{m.item}</td>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={m.quantity} 
                                        onChange={(e) => handleUpdateMaterialQty(boq.id, index, e.target.value)} 
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} 
                                      />
                                    </td>
                                    <td>{m.unit || 'SqM'}</td>
                                    <td>₹{m.price}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(m.total).toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>
                                      <button className="btn-icon-only" style={{ color: 'var(--danger)', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} onClick={() => handleDeleteMaterial(boq.id, index)} title="Delete material">
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {boq.materials.filter(m => m.category === 'Sheets - type').length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px' }}>No sheets added yet.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* CATEGORY 3: Accessories */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', borderBottom: '2px solid var(--primary-light)', paddingBottom: '4px' }}>3. Accessories</h4>
                            <table className="crm-table">
                              <thead>
                                <tr>
                                  <th>Item Specification</th>
                                  <th style={{ width: '150px' }}>Quantity Required</th>
                                  <th>Unit</th>
                                  <th>Price / Unit</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                  <th style={{ width: '40px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {boq.materials.map((m, index) => ({ m, index })).filter(({ m }) => m.category === 'Accessories' || !m.category).map(({ m, index }) => (
                                  <tr key={index}>
                                    <td style={{ fontWeight: 600 }}>{m.item}</td>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={m.quantity} 
                                        onChange={(e) => handleUpdateMaterialQty(boq.id, index, e.target.value)} 
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} 
                                      />
                                    </td>
                                    <td>{m.unit || 'Nos'}</td>
                                    <td>₹{m.price}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(m.total).toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>
                                      <button className="btn-icon-only" style={{ color: 'var(--danger)', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} onClick={() => handleDeleteMaterial(boq.id, index)} title="Delete material">
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {boq.materials.filter(m => m.category === 'Accessories' || !m.category).length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px' }}>No accessories added yet.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* RIGHT BAR: Material creation form & actions */}
                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>Create / Add Material</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Category</label>
                                <select 
                                  value={newMatCategory} 
                                  onChange={(e) => {
                                    setNewMatCategory(e.target.value);
                                    if (e.target.value === 'M.S materials - type') setNewMatUnit('rft');
                                    else if (e.target.value === 'Sheets - type') setNewMatUnit('SqM');
                                    else setNewMatUnit('Nos');
                                  }} 
                                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                >
                                  <option value="M.S materials - type">1. M.S materials</option>
                                  <option value="Sheets - type">2. Sheets</option>
                                  <option value="Accessories">3. Accessories</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Material name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. M.S Pipes, puff sheet, Brush" 
                                  value={newMatName} 
                                  onChange={(e) => setNewMatName(e.target.value)} 
                                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                  list="predefined-materials"
                                />
                                <datalist id="predefined-materials">
                                  <option value="M.S Pipes" />
                                  <option value="M.S Tubes" />
                                  <option value="M.S Plates" />
                                  <option value="Fabric" />
                                  <option value="GI sheet" />
                                  <option value="puff sheet" />
                                  <option value="Polycarbonate sheet" />
                                  <option value="uPVC sheet" />
                                  <option value="uPVC Gutter" />
                                  <option value="Screwa" />
                                  <option value="Aluminium Flats" />
                                  <option value="Flashing sheet" />
                                  <option value="Sealent" />
                                  <option value="Paint - Enammel" />
                                  <option value="Paint - Epoxy" />
                                  <option value="Brush" />
                                  <option value="Tinner" />
                                  <option value="Primer" />
                                </datalist>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Quantity Required</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. 120, 250" 
                                  value={newMatQty} 
                                  onChange={(e) => setNewMatQty(e.target.value)} 
                                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Unit</label>
                                  <select 
                                    value={newMatUnit} 
                                    onChange={(e) => setNewMatUnit(e.target.value)} 
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                  >
                                    <option value="rft">rft</option>
                                    <option value="Nos">Nos</option>
                                    <option value="lits">lits</option>
                                    <option value="SqM">SqM</option>
                                    <option value="kgs">kgs</option>
                                    <option value="Tons">Tons</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Price / Unit</label>
                                  <input 
                                    type="number" 
                                    placeholder="e.g. 15" 
                                    value={newMatPrice} 
                                    onChange={(e) => setNewMatPrice(e.target.value)} 
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                                  />
                                </div>
                              </div>
                              <button 
                                type="button" 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '8px', marginTop: '6px', fontSize: '0.8rem' }} 
                                onClick={() => handleCreateMaterial(boq.id)}
                              >
                                Create Material
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Cost Estimation</span>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{boq.estimatedCost}</h4>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimating Engineer</span>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{boq.engineer}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="btn-primary" onClick={() => handleBoqStatus(boq.id, 'Approved')}>Approve BOQ</button>
                            <button className="btn-secondary" onClick={() => handleBoqStatus(boq.id, 'Preparing')}>Request Correction</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>BOQ Estimation Tracker</h4>
                    <button className="btn-primary" onClick={() => setIsCreateBoqFormOpen(!isCreateBoqFormOpen)}>
                      {isCreateBoqFormOpen ? 'Close Creator' : 'Create New BOQ'}
                    </button>
                  </div>

                  {isCreateBoqFormOpen && (
                    <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Select Lead ID / Project</label>
                        <select 
                          value={selectedLeadIdForBoq} 
                          onChange={(e) => setSelectedLeadIdForBoq(e.target.value)} 
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                        >
                          <option value="">Select a Lead...</option>
                          {requests.map(r => (
                            <option key={r.id} value={r.id}>{getLeadId(r)} - {r.projectName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimating Engineer</label>
                        <select 
                          value={selectedBoqEngineer} 
                          onChange={(e) => setSelectedBoqEngineer(e.target.value)} 
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                        >
                          <option value="Neha Roy">Neha Roy</option>
                          <option value="Vikram Malhotra">Vikram Malhotra</option>
                          <option value="Amit Patel">Amit Patel</option>
                          <option value="Priya Das">Priya Das</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Version</label>
                        <select 
                          value={newBoqVersion} 
                          onChange={(e) => setNewBoqVersion(e.target.value)} 
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                        >
                          <option value="V1">V1</option>
                          <option value="V2">V2</option>
                          <option value="V3">V3</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                        <select 
                          value={newBoqStatus} 
                          onChange={(e) => setNewBoqStatus(e.target.value)} 
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                        >
                          <option value="Preparing">Preparing</option>
                          <option value="Waiting Approval">Waiting Approval</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                      <button className="btn-primary" onClick={handleGenerateBoq} style={{ padding: '9px 20px', height: '36px', fontSize: '0.85rem' }}>
                        Generate BOQ
                      </button>
                    </div>
                  )}

                  <div className="table-wrapper">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Project Type</th>
                          <th>Engineer</th>
                          <th>Material Count</th>
                          <th>Estimated Cost</th>
                          <th>Version</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boqList.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.projectType}</td>
                            <td>{b.engineer}</td>
                            <td>{b.materialCount} items</td>
                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>{b.estimatedCost}</td>
                            <td>{b.version}</td>
                            <td><span className={`badge ${b.status === 'Approved' ? 'badge-approved' : 'badge-inprogress'}`}>{b.status}</span></td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedBoqId(b.id)}>View Materials</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DESIGN TEAM */}
          {currentTab === 'Design Team' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setIsAddDesignerOpen(true)}><UserPlus size={16} /> Add Designer</button>
              </div>
              {isAddDesignerOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setIsAddDesignerOpen(false)}>
                  <form onClick={(e) => e.stopPropagation()} onSubmit={handleCreateDesigner} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '460px', maxWidth: '100%', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add Team Member</h3>
                      <button type="button" onClick={() => setIsAddDesignerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Full Name *<input style={fieldStyle} value={newDesigner.name} onChange={(e) => setND('name', e.target.value)} /></label>
                      <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Role / Title<input style={fieldStyle} placeholder="PEB Specialist" value={newDesigner.role} onChange={(e) => setND('role', e.target.value)} /></label>
                      <label style={labelStyle}>Experience<input style={fieldStyle} placeholder="5 Years" value={newDesigner.experience} onChange={(e) => setND('experience', e.target.value)} /></label>
                      <label style={labelStyle}>Availability<select style={fieldStyle} value={newDesigner.availability} onChange={(e) => setND('availability', e.target.value)}>{['Full-time', 'Part-time'].map(o => <option key={o}>{o}</option>)}</select></label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                      <button type="button" className="btn-secondary" onClick={() => setIsAddDesignerOpen(false)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={creatingDesigner}>{creatingDesigner ? 'Adding…' : 'Add Designer'}</button>
                    </div>
                  </form>
                </div>
              )}
              {/* Top summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {/* Card 1: Pending Assignment */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Assignment</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {requests.filter(r => r.status === 'New' || r.assignedDesigner === 'Unassigned').length}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                    <span style={{ color: '#D97706', fontWeight: 600 }}>Allocating</span>
                    <span style={{ color: 'var(--text-muted)' }}>Needs designer</span>
                  </div>
                </div>

                {/* Card 2: Active Projects */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Projects</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {requests.filter(r => r.status === 'In Progress').length}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>Active drawing</span>
                    <span style={{ color: 'var(--text-muted)' }}>In production</span>
                  </div>
                </div>

                {/* Card 3: Pending Review */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Review</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {requests.filter(r => ['Submitted for Approval','Resubmitted','Pending Review'].includes(r.status)).length}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}>Needs approval</span>
                    <span style={{ color: 'var(--text-muted)' }}>Drawing submittals</span>
                  </div>
                </div>
              </div>

              {selectedDesignerName ? (
                (() => {
                  const des = designers.find(d => d.name === selectedDesignerName);
                  if (!des) return <p>Designer not found</p>;
                  // Match this person's requests even if the roster name and the login
                  // account name differ slightly (e.g. "Yasar Arafath" vs "Yasar Arafath A").
                  const sameName = (a) => { a = (a || '').toLowerCase().trim(); const n = des.name.toLowerCase().trim(); return !!n && (a === n || a.startsWith(n) || n.startsWith(a)); };
                  const mine = requests.filter(r => sameName(r.assignedDesigner));
                  const ACTIVE_ST = ['Assigned', 'In Progress', 'Submitted for Approval', 'Resubmitted', 'Changes Requested', 'Rework Required', 'Pending Review', 'Revision Requested'];
                  const activeList = mine.filter(r => ACTIVE_ST.includes(r.status));
                  const completedList = mine.filter(r => ['Approved', 'Completed'].includes(r.status));
                  const pendingReviewList = mine.filter(r => ['Submitted for Approval', 'Resubmitted', 'Pending Review'].includes(r.status));
                  const revisionList = mine.filter(r => ['Changes Requested', 'Rework Required', 'Rejected', 'Revision Requested'].includes(r.status));
                  const revisionRate = mine.length ? Math.round((revisionList.length / mine.length) * 100) + '%' : '0%';
                  return (
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedDesignerName(null)}>&larr; Back to Team</button>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{des.name} - Profile & Metrics</h3>
                        </div>
                        <span className={`badge ${des.status === 'Available' ? 'badge-approved' : 'badge-inprogress'}`}>{des.status}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>{des.avatar}</div>
                          <div>
                            <strong>Role:</strong> {des.role}
                          </div>
                          <div>
                            <strong>Experience:</strong> {des.experience}
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Performance Analytics</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Active Assignments</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{activeList.length}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Completed Assignments</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{completedList.length}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pending Review</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{pendingReviewList.length}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Revision Rate</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{revisionRate}</div>
                            </div>
                          </div>

                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>Active Assignments</h4>
                          <div className="table-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                            <table className="crm-table" style={{ fontSize: '0.75rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                  <th style={{ padding: '10px 12px' }}>Project ID</th>
                                  <th style={{ padding: '10px 12px' }}>Project Name</th>
                                  <th style={{ padding: '10px 12px' }}>Type</th>
                                  <th style={{ padding: '10px 12px' }}>Drawing Task</th>
                                  <th style={{ padding: '10px 12px' }}>Due Date</th>
                                  <th style={{ padding: '10px 12px' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeList.map(r => (
                                  <tr key={r.id}>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.projectName}</td>
                                    <td style={{ padding: '10px 12px' }}>{r.projectType}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <span className="badge badge-new" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>{r.requirement}</span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>{r.dueDate}</td>
                                    <td style={{ padding: '10px 12px' }}>{getStatusBadge(r.status)}</td>
                                  </tr>
                                ))}
                                {activeList.length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No active assignments.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '20px 0 8px' }}>Completed Assignments</h4>
                          <div className="table-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                            <table className="crm-table" style={{ fontSize: '0.75rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                  <th style={{ padding: '10px 12px' }}>Project ID</th>
                                  <th style={{ padding: '10px 12px' }}>Project Name</th>
                                  <th style={{ padding: '10px 12px' }}>Type</th>
                                  <th style={{ padding: '10px 12px' }}>Approved On</th>
                                  <th style={{ padding: '10px 12px' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {completedList.map(r => (
                                  <tr key={r.id}>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.projectName}</td>
                                    <td style={{ padding: '10px 12px' }}>{r.projectType}</td>
                                    <td style={{ padding: '10px 12px' }}>{r.approvedDate || '\u2014'}</td>
                                    <td style={{ padding: '10px 12px' }}>{getStatusBadge(r.status)}</td>
                                  </tr>
                                ))}
                                {completedList.length === 0 && (
                                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No completed assignments yet.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                   <div className="table-wrapper">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Designer</th>
                          <th>Role</th>
                          <th>Current Tasks</th>
                          <th>Pending Review</th>
                          <th>Revisions</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designers.map(d => (
                          <tr key={d.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{d.avatar}</div>
                                <span style={{ fontWeight: 600 }}>{d.name}</span>
                              </div>
                            </td>
                            <td>{d.role}</td>
                            <td>{d.currentTasks} Active</td>
                            <td>{d.pendingReview}</td>
                            <td>{d.revisions}</td>
                             <td style={{ textAlign: 'center' }}>
                               <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                 <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => setSelectedDesignerName(d.name)}>View</button>
                               </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REVIEW QUEUE */}
          {currentTab === 'Review Queue' && (() => {
            const SUBMITTED = ['Submitted for Approval', 'Resubmitted', 'Pending Review'];
            const pending = requests.filter(r => SUBMITTED.includes(r.status));
            const grabSub = (fileId, name, dl) => fileId ? (dl ? filesApi.download(fileId, name) : filesApi.open(fileId, name)) : notify('No file stored for this submission.');
            return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Pending Design Approvals</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Designs submitted by the team, waiting for your review. {pending.length} pending.</p>
              </div>

              {pending.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px' }}>No designs waiting for approval.</div>
              )}

              {pending.map(r => {
                const subs = submittalsList.filter(x => x.reqId === r.id);
                const files = subs.length ? subs.map(x => ({ name: x.fileName, size: x.fileSize, fileId: x.fileId, version: x.version, by: x.submittedBy, date: x.submittedDate })) : (r.attachments || []).map(a => ({ name: a.name, size: a.size, fileId: a.fileId }));
                const fb = Array.isArray(r.feedback) ? r.feedback : [];
                const lastRemark = [...fb].reverse().find(f => f.role === 'Design Team');
                return (
                  <div key={r.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>{r.projectName} <span style={{ color: 'var(--primary)' }}>· {r.id}</span>{r.procurementProjectCode ? <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> · {r.procurementProjectCode}</span> : null}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {[r.customerName ? `Client: ${r.customerName}` : '', `Member: ${r.assignedDesigner || '—'}`, r.submittedAt ? `Submitted: ${r.submittedAt}` : '', r.submissionCount ? `Submission #${r.submissionCount}` : ''].filter(Boolean).join('  ·  ')}
                        </div>
                      </div>
                      <div>{getStatusBadge(r.status)}</div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>Submitted Files</div>
                      {files.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No files uploaded.</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {files.map((f, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', padding: '7px 10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#F8FAFC' }}>
                              <FileText size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}{f.version ? ` (${f.version})` : ''}{f.size ? ` · ${f.size}` : ''}</span>
                              {f.by ? <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.by}</span> : null}
                              <button className="btn-reset" style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => grabSub(f.fileId, f.name, false)}>View</button>
                              <button className="btn-reset" style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => grabSub(f.fileId, f.name, true)}>Download</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {lastRemark && lastRemark.text ? (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '4px' }}>Team Member Remarks</div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{lastRemark.text}</p>
                      </div>
                    ) : null}

                    {fb.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>Submission & Feedback History</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {fb.map((f, idx) => (
                            <div key={idx} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', gap: '8px', borderLeft: `3px solid ${f.role === 'Design Head' ? 'var(--primary)' : '#94A3B8'}`, paddingLeft: '8px' }}>
                              <span style={{ fontWeight: 700, color: f.role === 'Design Head' ? 'var(--primary)' : '#334155' }}>{f.action || f.role}</span>
                              <span style={{ flex: 1 }}>{f.text} <span style={{ color: 'var(--text-muted)' }}>— {f.by}{f.time ? `, ${f.time}` : ''}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success-light)' }} onClick={() => handleApprove(r)}>Approve</button>
                      <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderColor: 'var(--warning-light)' }} onClick={() => handleRequestChanges(r)}>Request Changes</button>
                      <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#FEE2E2' }} onClick={() => handleReject(r)}>Reject</button>
                      <button className="btn-reset" style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', marginLeft: 'auto' }} onClick={() => handleOpenDrawer(r)}>Open full request →</button>
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })()}

          {/* TAB 8: DRAWINGS LIBRARY */}
          {currentTab === 'Team Accounts' && <TeamAccounts />}

          {currentTab === 'Drawings Library' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
                {/* Folder directories */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Drawing Directories</h4>
                  {['All', '2D Drawings', '3D Drawings', 'BOQ'].map(folder => (
                    <button
                      key={folder}
                      onClick={() => setSelectedDrawingFolder(folder)}
                      style={{
                        padding: '10px',
                        border: 'none',
                        background: selectedDrawingFolder === folder ? 'var(--primary-light)' : 'none',
                        color: selectedDrawingFolder === folder ? 'var(--primary)' : 'var(--text-secondary)',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: selectedDrawingFolder === folder ? 600 : 400,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FolderOpen size={16} />
                      <span>{folder}</span>
                    </button>
                  ))}
                </div>

                {/* Drawing list cards */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setIsDwgUploadOpen(true)}><Paperclip size={16} /> Upload Drawing</button>
                  </div>
                  {isDwgUploadOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setIsDwgUploadOpen(false)}>
                      <form onClick={(e) => e.stopPropagation()} onSubmit={handleUploadDrawing} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '100%', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Upload Drawing</h3>
                          <button type="button" onClick={() => setIsDwgUploadOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <label style={labelStyle}>File *<input type="file" style={fieldStyle} onChange={(e) => setDwgFile(e.target.files?.[0] || null)} /></label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                          <label style={labelStyle}>Folder<select style={fieldStyle} value={dwgForm.folder} onChange={(e) => setDwgForm(f => ({ ...f, folder: e.target.value }))}>{['2D Drawings', '3D Drawings', 'BOQ'].map(o => <option key={o}>{o}</option>)}</select></label>
                          <label style={labelStyle}>Version<input style={fieldStyle} value={dwgForm.version} onChange={(e) => setDwgForm(f => ({ ...f, version: e.target.value }))} /></label>
                          <label style={labelStyle}>Project<input style={fieldStyle} value={dwgForm.project} onChange={(e) => setDwgForm(f => ({ ...f, project: e.target.value }))} /></label>
                          <label style={labelStyle}>Designer<input style={fieldStyle} value={dwgForm.designer} onChange={(e) => setDwgForm(f => ({ ...f, designer: e.target.value }))} /></label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                          <button type="button" className="btn-secondary" onClick={() => setIsDwgUploadOpen(false)}>Cancel</button>
                          <button type="submit" className="btn-primary" disabled={dwgUploading}>{dwgUploading ? 'Uploading…' : 'Upload'}</button>
                        </div>
                      </form>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {drawingsList.filter(d => selectedDrawingFolder === 'All' || d.folder === selectedDrawingFolder).map(dwg => (
                      <div key={dwg.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '150px', minWidth: 0 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{dwg.folder} &bull; {dwg.version}</div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dwg.name}>{dwg.name}</h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Project: <strong>{dwg.project}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Designer: {dwg.designer}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                          <button className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }} onClick={() => dwg.fileId ? filesApi.download(dwg.fileId, dwg.name) : notify('No file attached to this drawing.')}>Download</button>
                          <button className="btn-secondary" style={{ padding: '4px', fontSize: '0.75rem' }} title="View" onClick={() => dwg.fileId ? filesApi.open(dwg.fileId, dwg.name) : notify('No file attached to this drawing.')}><Eye size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: DOCUMENTS */}
          {currentTab === 'Documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Document Types Top Bar */}
              <div style={{ display: 'flex', gap: '10px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', overflowX: 'auto', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '12px', whiteSpace: 'nowrap' }}>Document Types:</span>
                {['All', '2D Requirements', '3D Briefs', 'BOQ Files', 'Site References'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDocCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      background: selectedDocCategory === cat ? 'var(--primary-light)' : 'none',
                      color: selectedDocCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: selectedDocCategory === cat ? 600 : 500,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FileText size={16} style={{ color: selectedDocCategory === cat ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <span>{cat}</span>
                  </button>
                ))}
              </div>

              {/* Full Width Table Card */}
              <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Project Documents Repository</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Manage structural drawings, designs, specifications and reference attachments</p>
                  </div>
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setIsDocUploadOpen(true)}><Paperclip size={16} /> Upload Document</button>
                </div>
                {isDocUploadOpen && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setIsDocUploadOpen(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleUploadDocument} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '100%', boxShadow: 'var(--shadow-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Upload Document</h3>
                        <button type="button" onClick={() => setIsDocUploadOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                      </div>
                      <label style={labelStyle}>File *<input type="file" style={fieldStyle} onChange={(e) => setDocFile(e.target.files?.[0] || null)} /></label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                        <label style={labelStyle}>Category<select style={fieldStyle} value={docForm.category} onChange={(e) => setDocForm(f => ({ ...f, category: e.target.value }))}>{['2D Requirements', '3D Briefs', 'BOQ Files', 'Site References'].map(o => <option key={o}>{o}</option>)}</select></label>
                        <label style={labelStyle}>Version<input style={fieldStyle} value={docForm.version} onChange={(e) => setDocForm(f => ({ ...f, version: e.target.value }))} /></label>
                        <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>Project<input style={fieldStyle} value={docForm.project} onChange={(e) => setDocForm(f => ({ ...f, project: e.target.value }))} /></label>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={() => setIsDocUploadOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={docUploading}>{docUploading ? 'Uploading…' : 'Upload'}</button>
                      </div>
                    </form>
                  </div>
                )}
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Document</th>
                      <th style={{ padding: '12px' }}>Project</th>
                      <th style={{ padding: '12px' }}>Uploaded By</th>
                      <th style={{ padding: '12px' }}>Version</th>
                      <th style={{ padding: '12px' }}>Upload Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentsList.filter(d => selectedDocCategory === 'All' || d.category === selectedDocCategory || (selectedDocCategory === 'PDF' && d.name.endsWith('.pdf'))).map(doc => {
                      const fileExt = doc.name.split('.').pop()?.toUpperCase() || 'FILE';
                      const getBadgeColor = (ext) => {
                        if (ext === 'PDF') return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
                        if (ext === 'DWG' || ext === 'DXF') return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
                        if (ext === 'ZIP' || ext === 'RAR') return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
                        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
                      };
                      const badge = getBadgeColor(fileExt);

                      return (
                        <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                backgroundColor: badge.bg, 
                                color: badge.text, 
                                border: `1px solid ${badge.border}`,
                                fontSize: '0.68rem', 
                                fontWeight: 800 
                              }}>
                                {fileExt}
                              </span>
                              <span style={{ fontWeight: 700, color: '#1E293B' }}>{doc.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '12px', 
                              backgroundColor: '#E0E7FF', 
                              color: '#3730A3', 
                              fontWeight: 700, 
                              fontSize: '0.75rem' 
                            }}>
                              {doc.project}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                backgroundColor: '#EFF6FF', 
                                color: '#2563EB', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.7rem', 
                                fontWeight: 700 
                              }}>
                                {doc.uploadedBy.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span style={{ fontWeight: 600, color: '#475569' }}>{doc.uploadedBy}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              backgroundColor: '#F1F5F9', 
                              color: '#475569', 
                              fontWeight: 700, 
                              fontSize: '0.72rem',
                              border: '1px solid #E2E8F0'
                            }}>
                              {doc.version}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', color: '#64748B', fontWeight: 500 }}>{doc.date}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                              onClick={() => doc.fileId ? filesApi.download(doc.fileId, doc.name) : notify('No file attached to this document.')}
                            >
                              <Download size={12} /> Download
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' }} 
                              onClick={() => handleDeleteDocument(doc)}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: CALENDAR */}
          {currentTab === 'Calendar' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Design Calendar</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>July 2026 schedule & deliverable deadlines</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span> Urgent</span>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span> High</span>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span> Normal / Medium</span>
                </div>
              </div>

              {/* Monthly grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', padding: '8px', color: 'var(--text-secondary)' }}>{day}</div>
                ))}
                
                {/* Empty cells for prefix days (July 1, 2026 is Wednesday, so Sunday, Monday, Tuesday are empty) */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`empty-${idx}`} style={{ minHeight: '100px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: '#F8FAFC', opacity: 0.4 }}></div>
                ))}

                {Array.from({ length: 31 }).map((_, idx) => {
                  const dateNum = idx + 1;
                  const dateStr = `2026-07-${dateNum < 10 ? '0' + dateNum : dateNum}`;
                  
                  // Filter requests on this day
                  const dayRequests = requests.filter(r => r.dueDate === dateStr);
                  const isToday = dateStr === '2026-07-18';
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        minHeight: '100px', 
                        border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        padding: '8px', 
                        backgroundColor: isToday ? 'var(--primary-light)' : '#FFFFFF', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px' 
                      }}
                    >
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem', 
                        color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                        backgroundColor: isToday ? 'rgba(30, 27, 75, 0.1)' : 'transparent',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {dateNum}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                        {dayRequests.map(r => {
                          const badgeColor = r.priority === 'Urgent' ? 'var(--danger)' : r.priority === 'High' ? 'var(--warning)' : 'var(--primary)';
                          const badgeBg = r.priority === 'Urgent' ? 'var(--danger-light)' : r.priority === 'High' ? 'var(--warning-light)' : 'var(--primary-light)';
                          return (
                            <div 
                              key={r.id} 
                              onClick={() => { setSelectedRequest(r); setDrawerOpen(true); }}
                              style={{ 
                                fontSize: '0.625rem', 
                                padding: '3px 6px', 
                                backgroundColor: badgeBg, 
                                color: badgeColor, 
                                borderRadius: '4px', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                borderLeft: `3px solid ${badgeColor}`,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.15s'
                              }}
                              title={`${r.id}: ${r.customerName} - ${r.projectName}`}
                              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
                            >
                              {r.id}
                            </div>
                          );
                        })}
                        
                        {/* Static calendar milestones fallback */}
                        {dateNum === 16 && (
                          <div style={{ fontSize: '0.625rem', padding: '3px 6px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '4px', fontWeight: 700, borderLeft: '3px solid var(--success)' }}>
                            Revision Sent
                          </div>
                        )}
                        {dateNum === 20 && (
                          <div style={{ fontSize: '0.625rem', padding: '3px 6px', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '4px', fontWeight: 700, borderLeft: '3px solid #64748B' }}>
                            BOQ Submission
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 11: NOTIFICATIONS */}
          {currentTab === 'Notifications' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Notification History</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { notificationsApi.markAllRead('head'); setNotifications(notifications.map(n => ({ ...n, read: true }))); }}>Mark All Read</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications yet.</div>
                )}
                {notifications.map(notif => (
                  <div key={notif.id} onClick={() => handleOpenNotification(notif)} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: !notif.read ? 'var(--primary-light)' : 'transparent', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: !notif.read ? 'var(--primary)' : 'var(--border-color)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bell size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{notif.title} {notif.category ? <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>({notif.category})</span> : null}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{notif.message || notif.desc}</p>
                      {notif.requestId ? <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>{notif.requestId} &rarr; open request</span> : null}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtDateTime(notif.createdAt, notif.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: SETTINGS */}
          {currentTab === 'Settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Settings</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>Configure your workspace, notifications, profile credentials, and system settings</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Column 1: User Profile */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={18} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>User Profile</h3>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={settingsFullName} 
                        onChange={(e) => setSettingsFullName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#F8FAFC', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, outline: 'none' }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email Address</label>
                      <input 
                        type="email" 
                        value={settingsEmail} 
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#F8FAFC', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, outline: 'none' }} 
                      />
                    </div>

                    {loginRole !== 'Design Head' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>System Role</label>
                        <input 
                          type="text" 
                          value={settingsRole} 
                          onChange={(e) => setSettingsRole(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#F8FAFC', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, outline: 'none' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Preferences & Theme */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={18} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Preferences & Theme</h3>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Email Alerts Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ paddingRight: '12px' }}>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Email Alerts</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive summaries of newly assigned leads</span>
                      </div>
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', flexShrink: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={settingsEmailAlerts} 
                          onChange={(e) => setSettingsEmailAlerts(e.target.checked)} 
                          style={{ opacity: 0, width: 0, height: 0 }} 
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: settingsEmailAlerts ? 'var(--primary)' : '#CBD5E1',
                          transition: '0.2s',
                          borderRadius: '20px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '14px', width: '14px',
                            left: settingsEmailAlerts ? '20px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.2s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>

                    {/* Desktop Notifications Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <div style={{ paddingRight: '12px' }}>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Desktop Notifications</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show desktop banners for urgent chat mentions</span>
                      </div>
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', flexShrink: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={settingsDesktopNotifications} 
                          onChange={(e) => setSettingsDesktopNotifications(e.target.checked)} 
                          style={{ opacity: 0, width: 0, height: 0 }} 
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: settingsDesktopNotifications ? 'var(--primary)' : '#CBD5E1',
                          transition: '0.2s',
                          borderRadius: '20px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '14px', width: '14px',
                            left: settingsDesktopNotifications ? '20px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.2s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>

                    {/* Theme dropdown selection */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        <Palette size={12} />
                        <span>Theme Mode</span>
                      </label>
                      <select 
                        value={settingsThemeMode} 
                        onChange={(e) => setSettingsThemeMode(e.target.value)} 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="StudioPro Navy (Default)">StudioPro Navy (Default)</option>
                        <option value="StudioPro Light">StudioPro Light</option>
                        <option value="StudioPro Dark">StudioPro Dark</option>
                      </select>
                    </div>

                  </div>
                </div>

              </div>

              {/* Bottom Row Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveSettings} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Save size={16} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          )}



        </main>
      </div>

      {/* DETAILED DRAWERS FOR INCOMING DESIGN REQUESTS */}
      {drawerOpen && selectedRequest && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-area">
                {selectedRequest.status === 'Pending Review' && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B5CF6', marginBottom: '6px' }}>
                    Request & Assign Task
                  </div>
                )}
                <span className="drawer-subtitle">{selectedRequest.id} &bull; {selectedRequest.projectType} Project</span>
                <h2 className="drawer-title" style={{ margin: '4px 0' }}>{selectedRequest.projectName}</h2>
                <div style={{ display: 'flex', gap: '16px', margin: '6px 0', flexWrap: 'wrap' }}>
                  {selectedRequest.projectManager ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Project Manager: <strong>{selectedRequest.projectManager}</strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Sales Manager: <strong>{selectedRequest.salesManager || selectedRequest.requestedBy?.replace(' (Sales Manager)', '') || 'Ritesh Deshmukh'}</strong>
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              <button className="action-btn" onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '0 24px' }}>
              <div className="drawer-tabs">
                {['Requirements', 'Attachments', 'Comments', 'Timeline', 'Revision Design'].map(tab => (
                  <button
                    key={tab}
                    className={`drawer-tab ${activeDrawerTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveDrawerTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="drawer-body">

              {/* PROJECT DETAILS (auto-fetched from Procurement, read-only) */}
              {(() => {
                const pj = drawerProject || {};
                const val = (x) => (x === 0 || x) ? x : '—';
                const rows = [
                  ['Project Name', val(pj.projectName || selectedRequest.projectName)],
                  ['Project Code', val(pj.projectCode || selectedRequest.procurementProjectCode)],
                  ['Client', val(pj.client || selectedRequest.customerName)],
                  ['Location', val(pj.location || selectedRequest.location)],
                  ['Project Type', val(pj.projectType || selectedRequest.projectType)],
                  ['Requirement', val(pj.requirement || selectedRequest.requirement || selectedRequest.service)],
                  ['Request From', val(catOf(selectedRequest))],
                  ['Priority', val(pj.priority || selectedRequest.priority)],
                  ['Due Date', val(pj.dueDate || selectedRequest.dueDate)],
                  ['Requested By', val(pj.requestedBy || selectedRequest.requestedBy)],
                ];
                if (pj.projectSize) rows.push(['Project Size', pj.projectSize]);
                if (pj.materialDescription) rows.push(['Material / Scope', pj.materialDescription]);
                if (pj.contactDetails) rows.push(['Contact', pj.contactDetails]);
                if (pj.siteAddress) rows.push(['Site Address', pj.siteAddress]);
                if (pj.salespersonName) rows.push(['Salesperson', pj.salespersonName]);
                if (pj.tentativeCompletionDate) rows.push(['Target Completion', pj.tentativeCompletionDate]);
                return (
                  <div className="info-section" style={{ marginBottom: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="info-section-title" style={{ margin: 0 }}>Project Details</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: selectedRequest.source === 'procurement' ? '#2563EB' : 'var(--text-muted)' }}>
                        {drawerProjectLoading ? 'Loading…' : (selectedRequest.source === 'procurement' ? 'From Procurement' : 'Design CRM')}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                      {rows.map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>{k}</span>
                          <span style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 500, wordBreak: 'break-word' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {selectedRequest.description && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Description</span>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedRequest.description}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SUBMISSION — files, date, remarks + feedback history (once work is submitted) */}
              {(() => {
                const st = selectedRequest.status;
                const SHOW = ['Submitted for Approval', 'Resubmitted', 'Pending Review', 'Approved', 'Completed', 'Changes Requested', 'Rework Required', 'Revision Requested', 'Rejected'];
                if (!SHOW.includes(st)) return null;
                const subs = submittalsList.filter(x => x.reqId === selectedRequest.id);
                const files = subs.length ? subs.map(x => ({ name: x.fileName, size: x.fileSize, fileId: x.fileId, version: x.version, by: x.submittedBy, date: x.submittedDate })) : (selectedRequest.attachments || []).map(a => ({ name: a.name, size: a.size, fileId: a.fileId }));
                const fb = Array.isArray(selectedRequest.feedback) ? selectedRequest.feedback : [];
                const lastRemark = [...fb].reverse().find(f => f.role === 'Design Team');
                const grab = (fileId, name, dl) => fileId ? (dl ? filesApi.download(fileId, name) : filesApi.open(fileId, name)) : notify('No file stored for this submission.');
                return (
                  <div className="info-section" style={{ marginBottom: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="info-section-title" style={{ margin: 0 }}>Submission</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedRequest.submittedAt ? `${selectedRequest.submittedAt}` : ''}{(selectedRequest.submittedBy || selectedRequest.assignedDesigner) ? ` · by ${selectedRequest.submittedBy || selectedRequest.assignedDesigner}` : ''}{selectedRequest.submissionCount ? ` · submission #${selectedRequest.submissionCount}` : ''}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>Submitted Files</div>
                    {files.length === 0 ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No files uploaded yet.</div> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {files.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', padding: '7px 10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#F8FAFC' }}>
                            <FileText size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}{f.version ? ` (${f.version})` : ''}{f.size ? ` · ${f.size}` : ''}</span>
                            <button className="btn-reset" style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => grab(f.fileId, f.name, false)}>View</button>
                            <button className="btn-reset" style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => grab(f.fileId, f.name, true)}>Download</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {lastRemark && lastRemark.text ? (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '4px' }}>Team Member Remarks</div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{lastRemark.text}</p>
                      </div>
                    ) : null}
                    {st === 'Rejected' && selectedRequest.rejectionReason ? <div style={{ marginTop: '10px', color: 'var(--bad)', fontSize: '0.82rem' }}><strong>Rejected:</strong> {selectedRequest.rejectionReason}</div> : null}
                    {['Changes Requested', 'Rework Required', 'Revision Requested'].includes(st) && selectedRequest.changeRemarks ? <div style={{ marginTop: '10px', color: '#B45309', fontSize: '0.82rem' }}><strong>Changes requested:</strong> {selectedRequest.changeRemarks}</div> : null}
                    {fb.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>Submission & Feedback History</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {fb.map((f, i) => (
                            <div key={i} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', gap: '8px', borderLeft: `3px solid ${f.role === 'Design Head' ? 'var(--primary)' : '#94A3B8'}`, paddingLeft: '8px' }}>
                              <span style={{ fontWeight: 700, color: f.role === 'Design Head' ? 'var(--primary)' : '#334155' }}>{f.action || f.role}</span>
                              <span style={{ flex: 1 }}>{f.text} <span style={{ color: 'var(--text-muted)' }}>— {f.by}{f.time ? `, ${f.time}` : ''}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeDrawerTab === 'Requirements' && (
                <div style={{ padding: '4px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  The project details for this request are shown above. Use the <strong>Attachments</strong> tab for files, <strong>Comments</strong> to message the team, and the footer actions to assign or review.
                </div>
              )}

              {activeDrawerTab === 'Attachments' && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Site Media & CAD Surveys</h3>
                  {selectedRequest.attachments?.map((file, idx) => (
                    <div key={idx} className="attachment-card">
                      <div className="attachment-meta">
                        <div className="attachment-icon">
                          <Paperclip size={16} />
                        </div>
                        <div>
                          <div className="attachment-name">{file.name}</div>
                          <span className="attachment-size">{file.size} &bull; {file.type}</span>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); file.fileId ? filesApi.download(file.fileId, file.name) : notify('No file attached.'); }}
                        style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {activeDrawerTab === 'Comments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                    {selectedRequest.comments?.map((comment, index) => (
                      <div key={index} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                          <strong>{comment.sender} ({comment.role})</strong>
                          <span className="text-muted">{comment.time}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1 }}
                      placeholder="Type internal query or note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {activeDrawerTab === 'Timeline' && (
                <div>
                  {/* Log history */}
                  <div style={{ marginTop: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>Activity Log</h4>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {selectedRequest.history?.map((hist, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-icon-container">
                            <History size={14} style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title" style={{ fontSize: '0.8rem' }}>{hist.title}</span>
                              <span className="timeline-time" style={{ fontSize: '0.7rem' }}>{hist.time}</span>
                            </div>
                            <span className="timeline-desc" style={{ fontSize: '0.75rem' }}>{hist.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'Revision Design' && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Revision Design Tracking</h3>
                  
                  {/* Revisions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {revisionsList.filter(rev => rev.project === selectedRequest.projectName).map(rev => (
                      <div key={rev.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{rev.revNumber} &bull; {rev.id}</span>
                          <span className={`badge ${rev.status === 'Urgent' ? 'badge-urgent' : 'badge-inprogress'}`} style={{ fontSize: '0.7rem' }}>{rev.status}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                          <strong>Comments:</strong> {rev.comments}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                          <div><strong>Requested By:</strong> {rev.requestedBy}</div>
                          <div><strong>Assigned Designer:</strong> {rev.designer}</div>
                          <div><strong>Old version:</strong> <span style={{ color: 'var(--primary)' }}>{rev.oldVersion}</span></div>
                          <div><strong>New version:</strong> <span style={{ color: 'var(--success)' }}>{rev.newVersion}</span></div>
                          <div><strong>Created Date:</strong> {rev.date}</div>
                          <div><strong>Due Date SLA:</strong> {rev.dueDate}</div>
                        </div>
                      </div>
                    ))}
                    {revisionsList.filter(rev => rev.project === selectedRequest.projectName).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                        No revisions have taken place for this design request yet.
                      </div>
                    )}
                  </div>

                  {/* Request Revision Form */}
                  <form onSubmit={handleRequestRevisionSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Request a New Revision</h4>
                    <div className="input-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>Revision Comments / Feedback</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Detail the requested changes, e.g., 'Increase roof span by 2 meters' or 'Add double door provision on west cladding'..."
                        value={revisionComment}
                        onChange={(e) => setRevisionComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                      Submit Revision Request
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="drawer-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px 24px', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
              {(() => {
                const st = selectedRequest.status;
                const SUBMITTED = ['Submitted for Approval', 'Resubmitted', 'Pending Review'];
                const CHANGES = ['Changes Requested', 'Rework Required', 'Revision Requested'];
                const btn = (bg, label, onClick) => <button type="button" className="btn-primary" style={{ backgroundColor: bg, flex: 1, padding: '10px' }} onClick={onClick}>{label}</button>;
                // Approved — no actions, just the approval record.
                if (['Approved', 'Completed'].includes(st)) return (
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>✓ Approved{selectedRequest.approvedBy ? ` by ${selectedRequest.approvedBy}` : ''}{selectedRequest.approvedDate ? ` on ${selectedRequest.approvedDate}` : ''}</div>
                );
                // Rejected — allow a fresh assignment.
                if (st === 'Rejected') return (<>
                  <div style={{ flex: 2, padding: '10px', color: 'var(--bad)', fontWeight: 700, fontSize: '0.85rem' }}>Rejected{selectedRequest.rejectionReason ? `: ${selectedRequest.rejectionReason}` : ''}</div>
                  {btn('var(--primary)', 'New Assignment', () => handleOpenAssignModal(selectedRequest))}
                </>);
                // Submitted / Resubmitted — review actions.
                if (SUBMITTED.includes(st)) return (<>
                  {btn('var(--success)', 'Approve', () => handleApprove(selectedRequest))}
                  {btn('var(--warning)', 'Request Changes', () => handleRequestChanges(selectedRequest))}
                  {btn('#DC2626', 'Reject', () => handleReject(selectedRequest))}
                </>);
                // Changes requested — waiting for the member to resubmit.
                if (CHANGES.includes(st)) return (<>
                  <div style={{ flex: 2, padding: '10px', color: '#B45309', fontWeight: 600, fontSize: '0.85rem' }}>Changes requested — waiting for the team member to upload revised files and resubmit.</div>
                  {btn('var(--primary)', 'Reassign', () => handleOpenAssignModal(selectedRequest))}
                </>);
                // Assigned / In Progress — not submitted yet; show assignee + allow reassign.
                if (['Assigned', 'In Progress'].includes(st)) return (<>
                  <div style={{ flex: 2, padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assigned to <strong style={{ color: 'var(--text-primary)' }}>{selectedRequest.assignedDesigner || '—'}</strong>{selectedRequest.dueDate ? ` · due ${selectedRequest.dueDate}` : ''}. Awaiting submission.</div>
                  {btn('var(--primary)', 'Reassign Designer', () => handleOpenAssignModal(selectedRequest))}
                </>);
                // New / unassigned — only assign.
                return btn('var(--primary)', 'Assign Designer', () => handleOpenAssignModal(selectedRequest));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR ASSIGN DESIGNER */}
      {isAssignModalOpen && assignModalRequest && (
        <div className="drawer-backdrop" onClick={() => { setIsAssignModalOpen(false); setAssignModalRequest(null); }} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '550px', padding: '28px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review & Assign Task</h3>
              </div>
              <button className="btn-icon-only" onClick={() => { setIsAssignModalOpen(false); setAssignModalRequest(null); }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAssignDesignerSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Select Designer</label>
                    <select className="form-control" style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required>
                      <option value="">Choose team member...</option>
                      {teamMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name}{m.designation ? ` — ${m.designation}` : ''}</option>
                      ))}
                      {teamMembers.length === 0 && <option value="" disabled>No team accounts — create one in Team Accounts</option>}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Due Date SLA</label>
                    <input type="date" className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                  <select className="form-control" style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} value={assignPriority} onChange={(e) => setAssignPriority(e.target.value)}>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Internal Design Notes</label>
                  <textarea className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} rows="3" value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="Enter details about drafting coordinates, roof pitch guidelines..."></textarea>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="notifyDesigner" checked={notifyDesignerCheckbox} onChange={(e) => setNotifyDesignerCheckbox(e.target.checked)} />
                  <label htmlFor="notifyDesigner" style={{ fontSize: '0.8rem', userSelect: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>Notify Designer via Email & CRM Inbox</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem' }} onClick={() => { setIsAssignModalOpen(false); setAssignModalRequest(null); }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '9px 24px', fontSize: '0.85rem' }}>Assign Designer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR REVISION FORM */}
      {isRevisionModalOpen && revisionModalRequest && (
        <div className="drawer-backdrop" onClick={() => { setIsRevisionModalOpen(false); setRevisionModalRequest(null); }} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '750px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Request Design Revision - {revisionModalRequest.id}</h3>
              <button className="btn-icon-only" onClick={() => { setIsRevisionModalOpen(false); setRevisionModalRequest(null); }}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', overflowY: 'auto', flex: 1, paddingRight: '4px', marginBottom: '16px' }}>
              {/* Left Panel: Lead Data & Designs */}
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>Project Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <div><strong>Project Type:</strong> {revisionModalRequest.projectType}</div>
                    <div><strong>Customer Name:</strong> {revisionModalRequest.customerName}</div>
                    <div><strong>Due Date SLA:</strong> {revisionModalRequest.dueDate}</div>
                    <div><strong>Priority Level:</strong> {revisionModalRequest.priority}</div>
                  </div>
                </div>

                {revisionModalRequest.pebDetails && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>Technical Dimensions</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px' }}>
                      <div><strong>Plot Size:</strong> {revisionModalRequest.pebDetails.length} x {revisionModalRequest.pebDetails.width}</div>
                      <div><strong>Bay Spacing:</strong> {revisionModalRequest.pebDetails.baySpacing}</div>
                      <div><strong>Columns:</strong> {revisionModalRequest.pebDetails.numColumns} / {revisionModalRequest.pebDetails.numBays} Bays</div>
                      <div><strong>Column Height:</strong> {revisionModalRequest.pebDetails.height}</div>
                      <div><strong>Roof Pitch:</strong> {revisionModalRequest.pebDetails.roofType}</div>
                      <div><strong>Cladding Type:</strong> {revisionModalRequest.pebDetails.wallCladding}</div>
                      <div><strong>Crane Ready:</strong> {revisionModalRequest.pebDetails.craneRequired || 'No'}</div>
                      <div><strong>Mezzanine:</strong> {revisionModalRequest.pebDetails.mezzanineRequired || 'No'}</div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>Design Files & Submittals</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {drawingsList.filter(d => d.project.toLowerCase().includes(revisionModalRequest.projectName.toLowerCase().substring(0, 10))).map(d => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', backgroundColor: '#F8FAFC' }}>
                        <span style={{ fontWeight: 600 }}>{d.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{d.folder} ({d.version})</span>
                      </div>
                    ))}
                    {drawingsList.filter(d => d.project.toLowerCase().includes(revisionModalRequest.projectName.toLowerCase().substring(0, 10))).length === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No design files uploaded yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel: Comments & Actions */}
              <form onSubmit={handleRevisionModalSubmit} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                    <strong>Assigned Designer:</strong> {revisionModalRequest.assignedDesigner || 'Unassigned'}
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Revision Comments / Feedback</label>
                    <textarea 
                      className="form-control" 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }} 
                      rows="6" 
                      value={revisionModalComments} 
                      onChange={(e) => setRevisionModalComments(e.target.value)} 
                      placeholder="Detail the requested changes clearly for the designer, e.g. increase spacing, modify roof structure materials, etc..." 
                      required
                    ></textarea>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setIsRevisionModalOpen(false); setRevisionModalRequest(null); }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px', backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: '#FFFFFF' }}>Request Revision</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;
