import React, { useState, useMemo, useEffect } from 'react';
import DesignTeamDashboard from './DesignTeamDashboard';
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

// Seeding Designers Data
const initialDesigners = [
  {
    id: 'D01',
    name: 'Rahul Sharma',
    role: 'Senior Architect / Structural',
    currentTasks: 3,
    availableCapacity: '15 hrs',
    workload: 75,
    status: 'Available',
    availability: 'Part-time',
    avatar: 'RS',
    experience: '8 Years',
    pendingReview: 1,
    revisions: 2,
    avgCompletionTime: '4.2 Days',
    completedProjects: 84,
    revisionRate: '8.5%'
  },
  {
    id: 'D02',
    name: 'Amit Patel',
    role: 'PEB Specialist',
    currentTasks: 4,
    availableCapacity: '2 hrs',
    workload: 95,
    status: 'Busy',
    availability: 'Full-time',
    avatar: 'AP',
    experience: '6 Years',
    pendingReview: 2,
    revisions: 4,
    avgCompletionTime: '5.8 Days',
    completedProjects: 62,
    revisionRate: '12.4%'
  },
  {
    id: 'D03',
    name: 'Priya Das',
    role: '3D Visualizer & Modeler',
    currentTasks: 1,
    availableCapacity: '25 hrs',
    workload: 30,
    status: 'Available',
    availability: 'Full-time',
    avatar: 'PD',
    experience: '4 Years',
    pendingReview: 0,
    revisions: 1,
    avgCompletionTime: '2.5 Days',
    completedProjects: 45,
    revisionRate: '4.8%'
  },
  {
    id: 'D04',
    name: 'Vikram Malhotra',
    role: '2D Draftsman & Detailing',
    currentTasks: 2,
    availableCapacity: '18 hrs',
    workload: 60,
    status: 'Available',
    availability: 'Full-time',
    avatar: 'VM',
    experience: '5 Years',
    pendingReview: 1,
    revisions: 3,
    avgCompletionTime: '3.1 Days',
    completedProjects: 98,
    revisionRate: '7.2%'
  },
  {
    id: 'D05',
    name: 'Neha Roy',
    role: 'BOQ & Estimator',
    currentTasks: 0,
    availableCapacity: '40 hrs',
    workload: 0,
    status: 'Available',
    availability: 'Full-time',
    avatar: 'NR',
    experience: '3 Years',
    pendingReview: 0,
    revisions: 0,
    avgCompletionTime: '1.8 Days',
    completedProjects: 31,
    revisionRate: '3.1%'
  },
  {
    id: 'D06',
    name: 'Design Head',
    role: 'Design Head / Manager',
    currentTasks: 0,
    availableCapacity: '40 hrs',
    workload: 0,
    status: 'Available',
    availability: 'Full-time',
    avatar: 'DH',
    experience: '12 Years',
    pendingReview: 0,
    revisions: 0,
    avgCompletionTime: '2.0 Days',
    completedProjects: 154,
    revisionRate: '2.1%'
  }
];

// Seeding Design Requests
const initialDesignRequests = [
  {
    id: 'REQ-2026-001',
    leadId: 'LD-1001',
    customerName: 'Aries Warehousing Pvt. Ltd.',
    projectName: 'PEB Warehouse',
    projectType: 'PEB',
    service: 'PEB Shed Designing',
    requirement: '2D + 3D',
    priority: 'Urgent',
    requestedBy: 'Ritesh Deshmukh (Sales Manager)',
    assignedDesigner: 'Amit Patel',
    dueDate: '2026-07-20',
    status: 'In Progress',
    budget: '$48,000',
    timeline: '3 Weeks',
    location: 'MIDC Chakan, Block G, Pune',
    deliverables: ['Roof Layout', 'Elevation', '2D Drawing', '3D Exterior Render', 'BOQ', 'Fabrication Drawing'],
    pebDetails: {
      span: '36 meters',
      length: '150 meters',
      width: '60 meters',
      height: '11 meters',
      builtUpArea: '9,000 sq meters',
      roofType: 'Standing Seam Double Skin',
      wallCladding: 'PUF Sandwich Panels (50mm)',
      craneRequired: 'Yes - 10 Ton Single Girder EOT Crane',
      heavyEquipment: 'Hydra and Scissor lifts for high works',
      scope: 'Structural design calculation & Fabrication drawings',
      budget: '$48,000',
      timeline: '3 Weeks',
      specialNotes: 'Mezzanine floor required for office space in front bay (15m x 15m).'
    },
    attachments: [
      { name: 'survey_sheet.pdf', size: '4.8 MB', type: 'PDF' },
      { name: 'cad_layout_draft.dwg', size: '18.2 MB', type: 'AutoCAD' },
      { name: 'site_photo_east.png', size: '3.1 MB', type: 'Image' }
    ],
    comments: [
      { sender: 'Ritesh Deshmukh', role: 'Sales Manager', text: 'Client wants to start fabrication by next month. Please expedite drawing reviews.', time: '2026-07-16 10:15 AM' },
      { sender: 'Amit Patel', role: 'Designer', text: 'Working on structural member sizing. Grid coordinates approved.', time: '2026-07-16 02:30 PM' }
    ],
    history: [
      { title: 'Sales Manager submitted request', time: '2026-07-15 11:30 AM', desc: 'Ritesh Deshmukh submitted the PEB Enquiry Form.' },
      { title: 'Request & Assign Task', time: '2026-07-15 03:00 PM', desc: 'Review completed. Found valid with standard scope.' },
      { title: 'Assigned to Designer', time: '2026-07-15 03:15 PM', desc: 'Assigned to Amit Patel for 2D + 3D detail.' },
      { title: 'Designer started work', time: '2026-07-16 09:00 AM', desc: 'Amit Patel marked the task In Progress.' }
    ]
  },
  {
    id: 'REQ-2026-002',
    leadId: 'LD-1002',
    customerName: 'Sharmila Housing Society',
    projectName: 'Residential Roof Structure',
    projectType: 'Mangalore Tile Roofing',
    service: 'Sloped Truss Roofing Design',
    requirement: '2D Drawing',
    priority: 'High',
    requestedBy: 'Sanjay Dutt (Sales Manager)',
    assignedDesigner: 'Vikram Malhotra',
    dueDate: '2026-07-22',
    status: 'Assigned',
    budget: '$12,500',
    timeline: '10 Days',
    location: 'Sector 56, Gurgaon, Haryana',
    deliverables: ['Floor Plan', 'Roof Layout', 'Elevation', 'Material Specification'],
    residentialDetails: {
      roofingType: 'Clay Tile Sloped Metal Frame',
      area: '3,800 sq ft',
      height: '14 ft',
      width: '50 ft',
      length: '76 ft',
      foundation: 'Reinforced Concrete Columns',
      existingStructure: 'Completed brick wall structure ready for roof frame setup',
      waterproofing: 'APP Modified Bitumen Membrane',
      heatInsulation: 'Glasswool roll with aluminum foil face',
      budget: '$12,500',
      timeline: '10 Days',
      specialNotes: 'Heavy rainfall area. Requires high-gradient gutter layout designs.'
    },
    attachments: [
      { name: 'structural_column_layout.pdf', size: '3.2 MB', type: 'PDF' },
      { name: 'villa_reference_model.jpg', size: '1.8 MB', type: 'Image' }
    ],
    comments: [],
    history: [
      { title: 'Sales Manager submitted request', time: '2026-07-16 09:12 AM', desc: 'Sanjay Dutt submitted Residential Enquiry Form.' },
      { title: 'Assigned to Designer', time: '2026-07-16 11:00 AM', desc: 'Design Head assigned project to Vikram Malhotra.' }
    ]
  },
  {
    id: 'REQ-2026-003',
    leadId: 'LD-1003',
    customerName: 'Tesco Corporate Office Plaza',
    projectName: 'Commercial Glass Canopy',
    projectType: 'Glass Roofing',
    service: 'Glass & Steel Canopy',
    requirement: 'BOQ',
    priority: 'Medium',
    requestedBy: 'Ritesh Deshmukh (Sales Manager)',
    salesManager: 'Ritesh Deshmukh',
    assignedDesigner: 'Priya Das',
    dueDate: '2026-07-28',
    status: 'Pending Review',
    budget: '$25,000',
    timeline: '15 Days',
    location: 'Connaught Place, New Delhi',
    deliverables: ['3D Exterior Render', 'Walkthrough Animation', '2D Drawing'],
    pebDetails: {
      span: '12 meters',
      length: '30 meters',
      width: '12 meters',
      height: '9 meters',
      builtUpArea: '360 sq meters',
      roofType: 'Tempered Laminated Glass Panel Frame',
      wallCladding: 'Stainless steel brackets and tension rods',
      craneRequired: 'Yes - Boom Crane for glass lifting',
      heavyEquipment: 'Spider glass handler assembly rig',
      scope: 'Architectural rendering and glass joint layout detailing',
      budget: '$25,000',
      timeline: '15 Days',
      specialNotes: 'Requires premium modern aesthetic. Needs mock presentation renders for the board review.'
    },
    attachments: [
      { name: 'canopy_specs_rev2.docx', size: '1.2 MB', type: 'Word Document' },
      { name: 'atrium_elevation.dwg', size: '9.4 MB', type: 'AutoCAD' }
    ],
    comments: [
      { sender: 'Priya Das', role: 'Designer', text: 'I have uploaded the primary renders for initial review. Please check.', time: '2026-07-16 03:00 PM' }
    ],
    history: [
      { title: 'Sales Manager submitted request', time: '2026-07-14 02:00 PM', desc: 'Ritesh Deshmukh submitted request for Tesco Plaza Atrium.' },
      { title: 'Assigned to Designer', time: '2026-07-14 04:30 PM', desc: 'Design Head assigned Priya Das for 3D Visuals.' },
      { title: 'Designer completed initial drawing', time: '2026-07-16 02:58 PM', desc: 'Priya Das submitted model layouts for Design Head review.' }
    ]
  },
  {
    id: 'REQ-2026-004',
    leadId: 'LD-1004',
    customerName: 'Choudhary Cold Storage',
    projectName: 'Thermal Food Storage Shed',
    projectType: 'PEB',
    service: 'Thermal PEB Roofing',
    requirement: '2D Drawing',
    priority: 'Normal',
    requestedBy: 'Sanjay Dutt (Sales Manager)',
    assignedDesigner: 'Unassigned',
    dueDate: '2026-08-05',
    status: 'New',
    budget: '$30,000',
    timeline: '30 Days',
    location: 'Bhiwandi Warehouse Zone, Mumbai',
    deliverables: ['Roof Layout', 'Structural Drawing', 'BOQ'],
    pebDetails: {
      span: '28 meters',
      length: '80 meters',
      width: '40 meters',
      height: '10 meters',
      builtUpArea: '3,200 sq meters',
      roofType: 'Standing Seam',
      wallCladding: 'Insulated Rockwool Panels (80mm)',
      craneRequired: 'No',
      heavyEquipment: 'Standard scaffolding scaffolding systems',
      scope: 'Structural analysis & material takeoff estimating',
      budget: '$30,000',
      timeline: '30 Days',
      specialNotes: 'Extremely critical insulation ratings. Roof sandwich panel design must match cold storage standards.'
    },
    attachments: [
      { name: 'layout_sketch_rough.png', size: '1.4 MB', type: 'Image' }
    ],
    comments: [],
    history: [
      { title: 'Sales Manager submitted request', time: '2026-07-16 04:10 PM', desc: 'Sanjay Dutt submitted request for Choudhary Cold Storage.' }
    ]
  },
  {
    id: 'REQ-2026-005',
    leadId: 'LD-1005',
    customerName: 'Tata Steel Processing Ltd.',
    projectName: 'Processing Plant Shed',
    projectType: 'PEB',
    service: 'Industrial Plant Design',
    requirement: '2D Layout + 3D Model',
    priority: 'High',
    requestedBy: 'Ritesh Deshmukh (Sales Manager)',
    assignedDesigner: 'Amit Patel',
    dueDate: '2026-07-15',
    status: 'Completed',
    budget: '$65,000',
    timeline: '4 Weeks',
    location: 'MIDC Ranjangaon, Pune',
    deliverables: ['GA Layout', '3D Model', 'Structural drawings', 'BOQ Sheet'],
    pebDetails: {
      span: '42 meters',
      length: '200 meters',
      width: '80 meters',
      height: '14 meters',
      builtUpArea: '16,000 sq meters',
      roofType: 'Standing Seam Insulation Double Skin',
      wallCladding: 'Steel sheeting (0.50 mm)',
      craneRequired: 'Yes - 25 Ton Crane',
      scope: 'Structural design & fabrication detailing',
      budget: '$65,000',
      timeline: '4 Weeks'
    },
    attachments: [
      { name: 'plant_shed_layout.dwg', size: '24.5 MB', type: 'AutoCAD' },
      { name: 'struc_analysis_report.std', size: '4.2 MB', type: 'STAAD' }
    ],
    comments: [
      { sender: 'Design Head', role: 'Coordinator', text: 'All design aspects check out. Drawings are approved for manufacturing.', time: '2026-07-14 04:00 PM' }
    ],
    history: [
      { title: 'Project Approved by Design Head', time: '2026-07-14 04:00 PM', desc: 'Design Head completed final submittal check and approved the project.' }
    ]
  },
  {
    id: 'REQ-2026-006',
    leadId: 'LD-1006',
    customerName: 'Jindal Steel & Power',
    projectName: 'Heavy Fabrication Workshop',
    projectType: 'PEB',
    service: 'Workshop Structural Detailing',
    requirement: '2D Drawings',
    priority: 'Normal',
    requestedBy: 'Sanjay Dutt (Sales Manager)',
    assignedDesigner: 'Vikram Malhotra',
    dueDate: '2026-07-18',
    status: 'Approved',
    budget: '$55,000',
    timeline: '3 Weeks',
    location: 'Raigarh Plant Zone, Chhattisgarh',
    deliverables: ['Erection Drawings', 'Part Drawings', '2D Drawings', 'BOQ'],
    pebDetails: {
      span: '30 meters',
      length: '120 meters',
      width: '50 meters',
      height: '12 meters',
      builtUpArea: '6,000 sq meters',
      roofType: 'Single Skin standing seam',
      wallCladding: 'Profiled metal sheet (0.50 mm)',
      craneRequired: 'Yes - 15 Ton overhead EOT crane',
      scope: 'Detailed 2D drawings & assembly models',
      budget: '$55,000',
      timeline: '3 Weeks'
    },
    attachments: [
      { name: 'workshop_erection_plan.dwg', size: '15.6 MB', type: 'AutoCAD' }
    ],
    comments: [
      { sender: 'Design Head', role: 'Coordinator', text: 'Drawings approved. Ready to dispatch.', time: '2026-07-17 11:30 AM' }
    ],
    history: [
      { title: 'Approved by Design Head', time: '2026-07-17 11:30 AM', desc: 'Design Head approved final design submittals.' }
    ]
  },
  {
    id: 'REQ-2026-007',
    leadId: 'LD-1007',
    customerName: 'Mahindra Logistics Hub',
    projectName: 'Logistics Sorting Terminal',
    projectType: 'PEB',
    service: 'PEB Layout & Detailing',
    requirement: '2D Layouts + BOQ',
    priority: 'High',
    requestedBy: 'Ritesh Deshmukh (Sales Manager)',
    assignedDesigner: 'Rahul Sharma',
    dueDate: '2026-07-19',
    status: 'Approved',
    budget: '$70,000',
    timeline: '4 Weeks',
    location: 'Chakan Logistics Park, Pune',
    deliverables: ['GA Layout', 'BOQ Sheet', 'Anchor Bolt Plan'],
    pebDetails: {
      span: '48 meters',
      length: '250 meters',
      width: '100 meters',
      height: '15 meters',
      builtUpArea: '25,000 sq meters',
      roofType: 'Standing Seam Double Skin with Glasswool insulation',
      wallCladding: 'Metal sheets with brick wall up to 3m',
      craneRequired: 'No',
      scope: 'Layout designing, anchor bolt detailing & BOQ generation',
      budget: '$70,000',
      timeline: '4 Weeks'
    },
    attachments: [
      { name: 'logistics_hub_layout.dwg', size: '32.1 MB', type: 'AutoCAD' }
    ],
    comments: [
      { sender: 'Design Head', role: 'Coordinator', text: 'Checked and approved. Please forward files to client.', time: '2026-07-18 02:45 PM' }
    ],
    history: [
      { title: 'Approved by Design Head', time: '2026-07-18 02:45 PM', desc: 'Final review completed. Layout and anchor bolt plans approved.' }
    ]
  },
  {
    id: 'REQ-2026-008',
    leadId: 'LD-1008',
    customerName: 'AeroHub Terminal Complex',
    projectName: 'Steel Truss Space Frame',
    projectType: 'PEB',
    service: 'Space Frame Designing',
    requirement: '3D Render',
    priority: 'High',
    requestedBy: 'Salman Khan (Project Manager)',
    projectManager: 'Salman Khan',
    assignedDesigner: 'Rahul Sharma',
    dueDate: '2026-08-02',
    status: 'Pending Review',
    budget: '$85,000',
    timeline: '4 Weeks',
    location: 'Kempegowda Int Airport, Bengaluru',
    deliverables: ['3D Render', 'Walkthrough Animation', 'BOQ Sheet'],
    pebDetails: {
      span: '40 meters',
      length: '180 meters',
      width: '80 meters',
      height: '16 meters',
      builtUpArea: '14,400 sq meters',
      roofType: 'Standing Seam',
      wallCladding: 'Glass curtain wall with metal sheeting',
      craneRequired: 'No',
      scope: 'Space frame architectural structural design',
      budget: '$85,000',
      timeline: '4 Weeks'
    },
    attachments: [
      { name: 'terminal_layout.dwg', size: '28.4 MB', type: 'AutoCAD' }
    ],
    comments: [
      { sender: 'Rahul Sharma', role: 'Designer', text: 'Completed space frame rendering. Awaiting review.', time: '2026-07-27 10:00 AM' }
    ],
    history: [
      { title: 'Sales Manager submitted request', time: '2026-07-25 09:00 AM', desc: 'Sanjay Dutt submitted space frame design request.' },
      { title: 'Assigned to Designer', time: '2026-07-25 11:30 AM', desc: 'Assigned to Rahul Sharma.' },
      { title: 'Designer completed submittal', time: '2026-07-27 10:00 AM', desc: 'Rahul Sharma submitted design files.' }
    ]
  }
];

const initialActivities = [
  { id: 1, user: 'Sanjay Dutt', action: 'submitted new design request', target: 'REQ-2026-004 (Thermal Food Storage Shed)', time: '1 hour ago' },
  { id: 2, user: 'Priya Das', action: 'completed draft rendering and sent for review', target: 'REQ-2026-003 (Commercial Glass Canopy)', time: '2 hours ago' },
  { id: 3, user: 'Amit Patel', action: 'started work', target: 'REQ-2026-001 (PEB Warehouse)', time: '6 hours ago' },
  { id: 4, user: 'Design Head', action: 'assigned request to Vikram Malhotra', target: 'REQ-2026-002 (Residential Roof Structure)', time: '8 hours ago' }
];

const initialBOQ = [
  {
    id: 'BOQ-2026-001',
    project: 'PEB Warehouse (MIDC)',
    projectType: 'PEB',
    engineer: 'Neha Roy',
    materialCount: 6,
    estimatedCost: '₹17,410',
    version: 'V2',
    status: 'Approved',
    materials: [
      { item: 'M.S Pipes', quantity: '120', unit: 'rft', price: '15', total: '1800', category: 'M.S materials - type' },
      { item: 'M.S Plates', quantity: '450', unit: 'kgs', price: '2', total: '900', category: 'M.S materials - type' },
      { item: 'GI sheet', quantity: '500', unit: 'SqM', price: '22', total: '11000', category: 'Sheets - type' },
      { item: 'uPVC Gutter', quantity: '250', unit: 'rft', price: '8', total: '2000', category: 'Accessories' },
      { item: 'Screwa', quantity: '5000', unit: 'Nos', price: '0.15', total: '750', category: 'Accessories' },
      { item: 'Paint - Enammel', quantity: '80', unit: 'lits', price: '12', total: '960', category: 'Accessories' }
    ]
  },
  {
    id: 'BOQ-2026-002',
    project: 'Commercial Glass Canopy',
    projectType: 'Glass Roofing',
    engineer: 'Neha Roy',
    materialCount: 3,
    estimatedCost: '₹17,840',
    version: 'V1',
    status: 'Preparing',
    materials: [
      { item: 'Polycarbonate sheet', quantity: '380', unit: 'SqM', price: '40', total: '15200', category: 'Sheets - type' },
      { item: 'M.S Tubes', quantity: '120', unit: 'rft', price: '18', total: '2160', category: 'M.S materials - type' },
      { item: 'Aluminium Flats', quantity: '120', unit: 'Nos', price: '4', total: '480', category: 'Accessories' }
    ]
  },
  {
    id: 'BOQ-2026-003',
    project: 'Residential Roof Structure',
    projectType: 'Mangalore Tile Roofing',
    engineer: 'Vikram Malhotra',
    materialCount: 4,
    estimatedCost: '₹9,675',
    version: 'V3',
    status: 'Waiting Approval',
    materials: [
      { item: 'uPVC sheet', quantity: '410', unit: 'SqM', price: '18', total: '7380', category: 'Sheets - type' },
      { item: 'M.S Pipes', quantity: '80', unit: 'rft', price: '15', total: '1200', category: 'M.S materials - type' },
      { item: 'Flashing sheet', quantity: '120', unit: 'rft', price: '6', total: '720', category: 'Accessories' },
      { item: 'Sealent', quantity: '75', unit: 'Nos', price: '5', total: '375', category: 'Accessories' }
    ]
  }
];

const initialDrawings = [
  { id: 'DWG-2D-001', name: 'Anchor_Bolt_Layout_Plan.dwg', folder: '2D Drawings', version: 'V2', designer: 'Vikram Malhotra', project: 'PEB Warehouse', date: '2026-07-16' },
  { id: 'DWG-3D-002', name: 'Main_Shed_Perspective_Renders.max', folder: '3D Drawings', version: 'V1', designer: 'Priya Das', project: 'PEB Warehouse', date: '2026-07-15' },
  { id: 'DWG-BOQ-003', name: 'Steel_Takeoff_Sheet.xlsx', folder: 'BOQ', version: 'V3', designer: 'Neha Roy', project: 'PEB Warehouse', date: '2026-07-16' },
  { id: 'DWG-CAD-004', name: 'Truss_Member_Fabrication_Detailing.dwg', folder: '2D Drawings', version: 'V1', designer: 'Amit Patel', project: 'PEB Warehouse', date: '2026-07-17' },
  { id: 'DWG-RND-005', name: 'Canopy_Atrium_Photorealistic.png', folder: '3D Drawings', version: 'V2', designer: 'Priya Das', project: 'Commercial Glass Canopy', date: '2026-07-16' }
];

const initialDocuments = [
  { id: 'DOC-001', name: 'MIDC_Chakan_Site_Soil_Report.pdf', category: '2D Requirements', project: 'PEB Warehouse', uploadedBy: 'Ritesh Deshmukh', version: 'V1', date: '2026-07-14' },
  { id: 'DOC-002', name: 'Roof_Load_Calculation_Shed.pdf', category: '2D Requirements', project: 'PEB Warehouse', uploadedBy: 'Amit Patel', version: 'V2', date: '2026-07-16' },
  { id: 'DOC-003', name: 'Commercial_Canopy_Quotation.pdf', category: 'BOQ Files', project: 'Commercial Glass Canopy', uploadedBy: 'Ritesh Deshmukh', version: 'V1', date: '2026-07-14' },
  { id: 'DOC-004', name: 'Choudhary_Shed_Reference_Photos.zip', category: 'Site References', project: 'Thermal Food Storage Shed', uploadedBy: 'Sanjay Dutt', version: 'V1', date: '2026-07-16' }
];

const initialRevisions = [
  { id: 'REV-001', project: 'Commercial Glass Canopy', revNumber: 'Rev 1', designer: 'Priya Das', requestedBy: 'Ritesh Deshmukh', dueDate: '2026-07-19', status: 'Pending', comments: 'Client wants larger steel columns for extra wind shear resistance.', oldVersion: 'Canopy_Model_v1.0.max', newVersion: 'Canopy_Model_v1.1.max', date: '2026-07-17' },
  { id: 'REV-002', project: 'PEB Warehouse', revNumber: 'Rev 2', designer: 'Amit Patel', requestedBy: 'Design Head', dueDate: '2026-07-18', status: 'Urgent', comments: 'Correct secondary sag rod spacing to correspond to heavy EOT crane vibration loads.', oldVersion: 'PEB_Warehouse_Layout_v2.0.dwg', newVersion: 'PEB_Warehouse_Layout_v2.1.dwg', date: '2026-07-18' }
];

const getLeadId = (r) => {
  if (!r) return 'N/A';
  if (r.leadId && r.leadId !== 'N/A') return r.leadId;
  const map = {
    'REQ-2026-001': 'LD-1001',
    'REQ-2026-002': 'LD-1002',
    'REQ-2026-003': 'LD-1003',
    'REQ-2026-004': 'LD-1004',
    'REQ-2026-005': 'LD-1005',
    'REQ-2026-006': 'LD-1006',
    'REQ-2026-007': 'LD-1007',
    'REQ-2026-008': 'LD-1008'
  };
  if (map[r.id]) return map[r.id];
  const hash = r.id ? r.id.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 9000);
  return `LD-${1000 + (hash % 1000)}`;
};

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [requests, setRequests] = useState(initialDesignRequests);
  const [designers, setDesigners] = useState(initialDesigners);
  const [activities, setActivities] = useState(initialActivities);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('Requirements');
  const [selectedDesignerName, setSelectedDesignerName] = useState(null);

  // Expanded CRM States
  const [projectsList, setProjectsList] = useState(initialDesignRequests.filter(r => r.status !== 'New'));
  const [boqList, setBoqList] = useState(initialBOQ);
  const [drawingsList, setDrawingsList] = useState(initialDrawings);
  const [documentsList, setDocumentsList] = useState(initialDocuments);
  const [revisionsList, setRevisionsList] = useState(initialRevisions);
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
  const [loginEmail, setLoginEmail] = useState('head@tesco.com');
  const [loginPassword, setLoginPassword] = useState('password123');
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

  const handleGenerateBoq = () => {
    if (!selectedLeadIdForBoq) {
      alert('Please select a Lead ID.');
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
    
    setBoqList(prev => [newBoq, ...prev]);
    setIsCreateBoqFormOpen(false);
    setSelectedBoqId(newBoq.id);
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

  const handleSaveRequirementForm = () => {
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
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, pebDetails: updatedDetails } : r));
    setSelectedRequest(prev => prev ? { ...prev, pebDetails: updatedDetails } : null);
    setIsRequirementFormOpen(false);
  };

  const handleUpdateMaterialQty = (boqId, materialIndex, newQty) => {
    setBoqList(prev => prev.map(b => {
      if (b.id !== boqId) return b;
      const updatedMaterials = [...b.materials];
      const mat = { ...updatedMaterials[materialIndex] };
      mat.quantity = newQty;
      const qtyVal = parseFloat(newQty);
      const priceVal = parseFloat(mat.price);
      if (!isNaN(qtyVal) && !isNaN(priceVal)) {
        mat.total = (qtyVal * priceVal).toFixed(2);
      } else {
        mat.total = '0';
      }
      updatedMaterials[materialIndex] = mat;
      const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
      return {
        ...b,
        materials: updatedMaterials,
        estimatedCost: `₹${sum.toLocaleString()}`
      };
    }));
  };

  const handleCreateMaterial = (boqId) => {
    if (!newMatName.trim()) {
      alert('Please enter a material name.');
      return;
    }
    setBoqList(prev => prev.map(b => {
      if (b.id !== boqId) return b;
      const newMat = {
        item: newMatName,
        quantity: newMatQty || '0',
        unit: newMatUnit,
        price: newMatPrice || '0',
        total: ((parseFloat(newMatQty) || 0) * (parseFloat(newMatPrice) || 0)).toFixed(2),
        category: newMatCategory
      };
      const updatedMaterials = [...b.materials, newMat];
      const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
      return {
        ...b,
        materials: updatedMaterials,
        estimatedCost: `₹${sum.toLocaleString()}`
      };
    }));
    setNewMatName('');
    setNewMatQty('');
    setNewMatPrice('');
  };

  const handleDeleteMaterial = (boqId, materialIndex) => {
    setBoqList(prev => prev.map(b => {
      if (b.id !== boqId) return b;
      const updatedMaterials = b.materials.filter((_, idx) => idx !== materialIndex);
      const sum = updatedMaterials.reduce((acc, m) => acc + parseFloat(m.total || 0), 0);
      return {
        ...b,
        materials: updatedMaterials,
        estimatedCost: `₹${sum.toLocaleString()}`
      };
    }));
  };

  
  // Inline date editor state
  const [editingDateId, setEditingDateId] = useState(null);
  const handleDateChange = (id, newDate) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, dueDate: newDate } : r));
    setProjectsList(prev => prev.map(r => r.id === id ? { ...r, dueDate: newDate } : r));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(prev => prev ? { ...prev, dueDate: newDate } : null);
    }
  };

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Request Submitted', message: 'Sanjay Dutt submitted REQ-2026-004 (Thermal Food Storage Shed)', read: false, time: '10:04 AM', category: 'Assignments' },
    { id: 2, title: 'Submission for Review', message: 'Priya Das uploaded Glass Atrium Renders for review', read: false, time: '09:42 AM', category: 'Reviews' },
    { id: 3, title: 'Urgent Revision Logged', message: 'Amit Patel assigned Revision V2 for PEB structures', read: true, time: 'Yesterday', category: 'Revisions' },
    { id: 4, title: 'Project Design Completed', message: 'Rahul Sharma finalized Truss designs for residential truss', read: true, time: '2 days ago', category: 'Completed' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const headNotifRef = React.useRef(null);

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
    
    const designerObj = designers.find(d => d.name === request.assignedDesigner);
    setAssigneeId(designerObj ? designerObj.id : '');
    setAssignDueDate(request.dueDate || '');
    setAssignEstHours(request.pebDetails?.timeline ? '24' : '16');
    setAssignPriority(request.priority || 'Medium');
    setAssignNotes('');
  };

  const handleOpenAssignModal = (request) => {
    setAssignModalRequest(request);
    setIsAssignModalOpen(true);
    const designerObj = designers.find(d => d.name === request.assignedDesigner);
    setAssigneeId(designerObj ? designerObj.id : '');
    setAssignDueDate(request.dueDate || '');
    setAssignEstHours('24');
    setAssignPriority(request.priority || 'Medium');
    setAssignNotes('');
  };

  const handleAssignDesignerSubmit = (e) => {
    e.preventDefault();
    const req = assignModalRequest || selectedRequest;
    if (!req || !assigneeId) return;

    const designerObj = designers.find(d => d.id === assigneeId);
    if (!designerObj) return;

    // Update requests state
    const updatedRequests = requests.map(r => {
      if (r.id === req.id) {
        const newHistory = [
          {
            title: 'Assigned to Designer',
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: `Assigned to ${designerObj.name}. Est: ${assignEstHours} Hrs. Due: ${assignDueDate || 'No Due Date'}.`
          },
          ...r.history
        ];
        return {
          ...r,
          assignedDesigner: designerObj.name,
          dueDate: assignDueDate,
          priority: assignPriority,
          status: 'Assigned',
          history: newHistory
        };
      }
      return r;
    });

    const updatedDesigners = designers.map(d => {
      if (d.id === assigneeId) {
        return {
          ...d,
          currentTasks: d.currentTasks + 1,
          workload: Math.min(100, d.workload + 15),
          status: 'Busy'
        };
      }
      return d;
    });

    const newActivity = {
      id: Date.now(),
      user: 'Design Head',
      action: `assigned project to ${designerObj.name}`,
      target: `${req.id} (${req.projectName})`,
      time: 'Just now'
    };

    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    setDesigners(updatedDesigners);
    setActivities([newActivity, ...activities]);
    
    // Add Notification
    setNotifications([
      {
        id: Date.now(),
        title: 'Designer Assigned',
        message: `Assigned ${req.id} to ${designerObj.name}`,
        read: false,
        time: 'Just now',
        category: 'Assignments'
      },
      ...notifications
    ]);

    if (selectedRequest && selectedRequest.id === req.id) {
      setSelectedRequest(updatedRequests.find(r => r.id === req.id));
    }
    
    setIsAssignModalOpen(false);
    setAssignModalRequest(null);
    alert(`Success: Project successfully assigned to ${designerObj.name}.`);
  };

  const handleDirectAssignDesigner = (requestId, designerName) => {
    const designerObj = designers.find(d => d.name === designerName);
    
    const updatedRequests = requests.map(r => {
      if (r.id === requestId) {
        const willBeUnassigned = designerName === 'Unassigned' || !designerName;
        const newHistory = [
          {
            title: 'Assigned to Designer',
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: willBeUnassigned 
              ? `Unassigned from ${r.assignedDesigner}`
              : `Assigned directly to ${designerName}`
          },
          ...r.history
        ];

        return {
          ...r,
          assignedDesigner: willBeUnassigned ? 'Unassigned' : designerName,
          status: willBeUnassigned ? 'New' : 'Assigned',
          history: newHistory
        };
      }
      return r;
    });

    const targetRequest = requests.find(r => r.id === requestId);
    const prevDesignerName = targetRequest ? targetRequest.assignedDesigner : 'Unassigned';

    const updatedDesigners = designers.map(d => {
      let currentTasks = d.currentTasks;
      let workload = d.workload;
      let status = d.status;

      if (prevDesignerName !== 'Unassigned' && d.name === prevDesignerName) {
        currentTasks = Math.max(0, currentTasks - 1);
        workload = Math.max(0, workload - 15);
      }
      if (designerName !== 'Unassigned' && d.name === designerName) {
        currentTasks = currentTasks + 1;
        workload = Math.min(100, workload + 15);
      }

      status = workload > 85 ? 'Busy' : 'Available';

      return { ...d, currentTasks, workload, status };
    });

    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    setDesigners(updatedDesigners);

    const newActivity = {
      id: Date.now(),
      user: 'Design Head',
      action: designerName !== 'Unassigned' 
        ? `reassigned request to ${designerName}`
        : `unassigned request`,
      target: `${requestId}`,
      time: 'Just now'
    };
    setActivities([newActivity, ...activities]);
  };

  const updateRequestStatus = (statusName, actionMessage, reqObj = null) => {
    const activeReq = reqObj || selectedRequest;
    if (!activeReq) return;

    const updatedRequests = requests.map(r => {
      if (r.id === activeReq.id) {
        const newHistory = [
          {
            title: actionMessage,
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: `Action performed by Design Head CRM.`
          },
          ...r.history
        ];
        return {
          ...r,
          status: statusName,
          history: newHistory
        };
      }
      return r;
    });

    const newActivity = {
      id: Date.now(),
      user: 'Design Head',
      action: actionMessage.toLowerCase(),
      target: `${activeReq.id} (${activeReq.projectName})`,
      time: 'Just now'
    };

    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    setActivities([newActivity, ...activities]);
    setSelectedRequest(updatedRequests.find(r => r.id === activeReq.id));

    setNotifications([
      {
        id: Date.now(),
        title: 'Status Approved & Shared',
        message: `Design files for ${activeReq.id} automatically sent to ${activeReq.requestedBy}`,
        read: false,
        time: 'Just now',
        category: 'Reviews'
      },
      ...notifications
    ]);

    if (statusName === 'Completed' || statusName === 'Approved') {
      alert(`Success: Design files for ${activeReq.projectName} (${activeReq.id}) have been automatically sent to ${activeReq.requestedBy}.`);
    }
  };

  const handleRequestRevisionSubmit = (e) => {
    e.preventDefault();
    if (!revisionComment.trim() || !selectedRequest) return;
    
    const currentRevs = revisionsList.filter(r => r.project === selectedRequest.projectName);
    const newRevNumber = `Rev ${currentRevs.length + 1}`;
    
    const newRev = {
      id: `REV-00${revisionsList.length + 1}`,
      project: selectedRequest.projectName,
      revNumber: newRevNumber,
      designer: selectedRequest.assignedDesigner || 'Unassigned',
      requestedBy: 'Design Head',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      comments: revisionComment,
      oldVersion: 'Drawing_Current.dwg',
      newVersion: 'Awaiting Submittal',
      date: new Date().toISOString().split('T')[0]
    };
    
    setRevisionsList(prev => [newRev, ...prev]);

    // Also update request status to 'In Progress' to reflect revision requested
    const updatedRequests = requests.map(r => {
      if (r.id === selectedRequest.id) {
        const newHistory = [
          {
            title: `Revision Requested (${newRevNumber})`,
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: `Comments: ${revisionComment}`
          },
          ...r.history
        ];
        return {
          ...r,
          status: 'In Progress',
          history: newHistory
        };
      }
      return r;
    });
    
    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id));
    setRevisionComment('');
    
    // Add Notification
    setNotifications([
      {
        id: Date.now(),
        title: 'Revision Requested',
        message: `Requested ${newRevNumber} for ${selectedRequest.projectName}`,
        read: false,
        time: 'Just now',
        category: 'Revisions'
      },
      ...notifications
    ]);
    
    alert(`Success: Revision requested successfully for ${selectedRequest.projectName}.`);
  };

  const handleOpenRevisionModal = (req) => {
    setRevisionModalRequest(req);
    setRevisionModalComments('');
    setIsRevisionModalOpen(true);
  };

  const handleRevisionModalSubmit = (e) => {
    e.preventDefault();
    if (!revisionModalComments.trim() || !revisionModalRequest) return;

    const currentRevs = revisionsList.filter(r => r.project === revisionModalRequest.projectName);
    const newRevNumber = `Rev ${currentRevs.length + 1}`;

    const newRev = {
      id: `REV-00${revisionsList.length + 1}`,
      project: revisionModalRequest.projectName,
      revNumber: newRevNumber,
      designer: revisionModalRequest.assignedDesigner || 'Unassigned',
      requestedBy: 'Design Head',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      comments: revisionModalComments,
      oldVersion: 'Drawing_Current.dwg',
      newVersion: 'Awaiting Submittal',
      date: new Date().toISOString().split('T')[0]
    };

    setRevisionsList(prev => [newRev, ...prev]);

    // Also update request status to 'In Progress' to reflect revision requested
    const updatedRequests = requests.map(r => {
      if (r.id === revisionModalRequest.id) {
        const newHistory = [
          {
            title: `Revision Requested (${newRevNumber})`,
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            desc: `Comments: ${revisionModalComments}`
          },
          ...r.history
        ];
        return {
          ...r,
          status: 'In Progress',
          history: newHistory
        };
      }
      return r;
    });

    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    
    if (selectedRequest && selectedRequest.id === revisionModalRequest.id) {
      setSelectedRequest(updatedRequests.find(r => r.id === revisionModalRequest.id));
    }

    // Add Notification
    setNotifications([
      {
        id: Date.now(),
        title: 'Revision Requested',
        message: `Requested ${newRevNumber} for ${revisionModalRequest.projectName}`,
        read: false,
        time: 'Just now',
        category: 'Revisions'
      },
      ...notifications
    ]);

    setIsRevisionModalOpen(false);
    setRevisionModalRequest(null);
    setRevisionModalComments('');
    alert(`Success: Revision requested successfully for ${revisionModalRequest.projectName}.`);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      sender: 'Design Head',
      role: 'Manager',
      text: newComment,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedRequests = requests.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          comments: [...r.comments, newCommentObj]
        };
      }
      return r;
    });

    setRequests(updatedRequests);
    setProjectsList(updatedRequests.filter(r => r.status !== 'New'));
    setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id));
    setNewComment('');
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

  // Filtered Requests Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch =
        r.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
        (getLeadId(r).toLowerCase().includes(searchText.toLowerCase())) ||
        r.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.id.toLowerCase().includes(searchText.toLowerCase()) ||
        r.requestedBy.toLowerCase().includes(searchText.toLowerCase());

      const matchType = filterType === 'All' || r.projectType === filterType;
      const matchReq = filterRequirement === 'All' || r.requirement === filterRequirement;
      const matchPriority = filterPriority === 'All' || r.priority === filterPriority;
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      const matchDesigner = filterDesigner === 'All' || r.assignedDesigner === filterDesigner;
      const matchSM = filterSalesManager === 'All' || r.requestedBy.includes(filterSalesManager);

      return matchSearch && matchType && matchReq && matchPriority && matchStatus && matchDesigner && matchSM;
    });
  }, [requests, searchText, filterType, filterRequirement, filterPriority, filterStatus, filterDesigner, filterSalesManager]);

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
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        fontFamily: 'var(--font-sans)',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
          maxWidth: '960px',
          height: '600px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          borderLeft: '4px solid #2563EB',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          
          {/* Left Column: Form */}
          <div style={{
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}>
            {/* Header: Logo & Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#1E3A8A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  T
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>TescoStructures</h2>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, margin: '0 0 24px 0' }}>Steel Design & Estimation Workspace</p>

              {/* Role Selection Tabs */}
              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', backgroundColor: '#F8FAFC', marginBottom: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setLoginRole('Design Head'); setLoginEmail('head@tesco.com'); }}
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: loginRole === 'Design Head' ? '#FFFFFF' : 'transparent', color: loginRole === 'Design Head' ? '#1E3A8A' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: loginRole === 'Design Head' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                >
                  Design Head
                </button>
                <button 
                  type="button" 
                  onClick={() => { setLoginRole('Design Team'); setLoginEmail('team@tesco.com'); }}
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: loginRole === 'Design Team' ? '#FFFFFF' : 'transparent', color: loginRole === 'Design Team' ? '#1E3A8A' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: loginRole === 'Design Team' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                >
                  Design Team
                </button>
              </div>

              {/* Inputs */}
              <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <input 
                    type="email" 
                    placeholder="Email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    placeholder="Password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                  <a href="#forgot" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E3A8A', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email!'); }}>
                    Forget Password?
                  </a>
                </div>

                <button 
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#223C8A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(34, 60, 138, 0.25)',
                    transition: 'all 0.2s',
                    marginTop: '8px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1C3171'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#223C8A'; }}
                >
                  Login
                </button>
              </form>
            </div>

            {/* Footer */}
            <div>
              <div style={{ borderTop: '1px solid #E2E8F0', margin: '24px 0' }} />
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
                Don't have an account? <a href="#signup" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); alert('Self-service signup is restricted. Please contact system admin.'); }}>Sign Up</a>
              </div>
            </div>

          </div>

          {/* Right Column: Image */}
          <div style={{
            backgroundImage: `url('/structural_background.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%'
          }} />

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
        onLogout={() => setIsLoggedIn(false)}
        loginEmail={loginEmail}
      />
    );
  }

  return (
    <div className="app-layout" style={{ fontFamily: 'var(--font-sans)', display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar" style={{ width: '260px', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div className="sidebar-logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#34328C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>T</div>
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
            { id: 'Review Queue', label: 'Review Queue', icon: <CheckSquare size={18} /> },
            { id: 'Documents', label: 'Documents', icon: <FileText size={18} /> },
            { id: 'Calendar', label: 'Calendar', icon: <CalendarRange size={18} /> },
            { id: 'Notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'Settings', label: 'Settings', icon: <Settings size={18} /> },
            { id: 'Tesco ERM', label: 'Tesco ERM', icon: <Database size={18} /> }
          ].map(item => (
            <li key={item.id}>
              <div
                className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'Tesco ERM') {
                    window.open('/erm.html', '_blank');
                    return;
                  }
                  setCurrentTab(item.id);
                  setSelectedProjectId(null);
                  setSelectedBoqId(null);
                  if (item.id === 'Design Team') {
                    setSelectedDesignerName(null);
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
                  backgroundColor: currentTab === item.id 
                    ? (item.id === 'Tesco ERM' ? '#44A810' : 'rgba(255,255,255,0.15)') 
                    : (item.id === 'Tesco ERM' ? 'rgba(68, 168, 16, 0.15)' : 'transparent'),
                  color: currentTab === item.id 
                    ? '#FFFFFF' 
                    : (item.id === 'Tesco ERM' ? '#A3E635' : 'rgba(255,255,255,0.8)')
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
              onClick={() => { setIsLoggedIn(false); setCurrentTab('Dashboard'); }}
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
                {notifications.some(n => !n.read) && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>
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
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    Mark all read
                  </button>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: !notif.read ? '#F8FAFC' : 'transparent' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1E293B' }}>{notif.title}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{notif.time} &bull; {notif.category}</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                {[
                  { title: 'New Design Requests', value: requests.filter(r => r.status === 'New').length, icon: <Inbox size={20} />, trend: '+3 today', desc: 'From sales team', color: '#2B2E83', bg: '#EEF2F6', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('New'); setFilterDesigner('All'); } },
                  { title: 'Pending Assignment', value: requests.filter(r => r.assignedDesigner === 'Unassigned').length, icon: <UserPlus size={20} />, trend: 'Allocating', desc: 'Needs designer', color: '#F59E0B', bg: '#FEF3C7', onClick: () => { setCurrentTab('Design Requests'); setFilterDesigner('Unassigned'); setFilterStatus('All'); } },
                  { title: 'Active Projects', value: requests.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length, icon: <Clock size={20} />, trend: 'Active drawing', desc: 'In production', color: '#5C6AC4', bg: '#E0E7FF', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('In Progress'); setFilterDesigner('All'); } },
                  { title: 'Pending Review', value: requests.filter(r => r.status === 'Pending Review').length, icon: <AlertTriangle size={20} />, trend: 'Needs approval', desc: 'Drawing submittals', color: '#8B5CF6', bg: '#F3E8FF', onClick: () => { setCurrentTab('Review Queue'); } },
                  { title: 'Client Revisions', value: revisionsList.filter(r => r.status === 'Pending' || r.status === 'Urgent').length, icon: <MessageSquare size={20} />, trend: 'Active cycles', desc: 'Review adjustments', color: '#EF4444', bg: '#FEE2E2', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('In Progress'); setFilterDesigner('All'); } },
                  { title: 'Completed This Week', value: requests.filter(r => r.status === 'Completed' || r.status === 'Approved').length + 2, icon: <CheckCircle2 size={20} />, trend: '+4 vs last week', desc: 'Ready for site', color: '#22C55E', bg: '#DCFCE7', onClick: () => { setCurrentTab('Design Requests'); setFilterStatus('Completed'); setFilterDesigner('All'); } }
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
                  {requests.filter(r => r.status === 'Pending Review').map(r => (
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
                            value={r.assignedDesigner} 
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
                            <option value="Unassigned">Unassigned</option>
                            {designers.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {r.dueDate}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="badge badge-completed" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); setSelectedRequest(r); updateRequestStatus('Completed', `Approved drawings for ${r.id}`, r); }}>Assign task</button>
                          <button className="badge badge-urgent" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); setSelectedRequest(r); updateRequestStatus('In Progress', `Rejected submittal for ${r.id}`, r); }}>Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.filter(r => r.status === 'Pending Review').length === 0 && (
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

              {/* ROW 4: TEAM WORKLOAD */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Design Team Workload Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {designers.slice(0, 4).map((des, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#34328C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {des.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{des.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{des.role}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: des.workload > 85 ? 'var(--danger)' : 'var(--success)' }}>{des.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '2px' }}>
                          <span>{des.currentTasks} Tasks</span>
                          <span>{des.workload}% Workload</span>
                        </div>
                        <div className="progress-bar-container" style={{ height: '5px' }}>
                          <div className="progress-bar-fill" style={{ width: `${des.workload}%`, backgroundColor: des.workload > 85 ? 'var(--danger)' : 'var(--success)' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 5: DEADLINES & REVISIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Drawing Deadline Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { period: 'Overdue Projects', project: 'Commercial Canopy', due: 'Due 2 days ago', badgeColor: 'var(--danger)' },
                      { period: 'Due Today', project: 'PEB Warehouse', due: 'Due at 05:00 PM', badgeColor: 'var(--warning)' },
                      { period: 'Due Tomorrow', project: 'Residential Roof', due: 'Due by 12:00 PM', badgeColor: 'var(--primary)' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', borderLeft: `4px solid ${item.badgeColor}`, backgroundColor: 'var(--bg-secondary)' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: item.badgeColor }}>{item.period}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{item.project}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.due}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Client Revision Tracker</h3>
                  <div className="table-wrapper">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Revision #</th>
                          <th>Designer</th>
                          <th>Status</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revisionsList.map((rev, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{rev.project}</td>
                            <td>{rev.revNumber}</td>
                            <td>{rev.designer}</td>
                            <td><span className="badge badge-assigned">{rev.status}</span></td>
                            <td>{getPriorityBadge(rev.designer === 'Amit Patel' ? 'Urgent' : 'High')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ROW 6: DEPARTMENT ACTIVITIES & ALERTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Urgent Department Alerts</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { alert: '3 Projects Overdue', desc: 'Shed design timeline breaches', action: 'Reallocate tasks' },
                      { alert: '2 Designers Overloaded', desc: 'Workload values above 90%', action: 'Balance capacity' },
                      { alert: '5 Drawings Pending Approval', desc: 'Awaiting engineering signoff', action: 'Review submittals' },
                      { alert: 'Client Waiting Revision', desc: 'Tensile design changes', action: 'Expedite drawings' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)' }}>{item.alert}</div>
                          <div style={{ fontSize: '0.7rem', color: '#7F1D1D', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary-hover)', textDecoration: 'underline', marginTop: '8px', cursor: 'pointer' }} onClick={() => alert(`Redirecting to action: ${item.action}`)}>{item.action} &rarr;</span>
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
                  { title: 'Waiting Review', val: requests.filter(r => r.status === 'Pending Review').length, color: '#8B5CF6' },
                  { title: 'Revision', val: revisionsList.filter(r => r.status === 'Pending' || r.status === 'Urgent').length, color: '#EF4444' },
                  { title: 'Completed', val: requests.filter(r => r.status === 'Completed' || r.status === 'Approved').length, color: '#22C55E' }
                ].map((s, idx) => (
                  <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.val}</div>
                  </div>
                ))}
              </div>



              {/* Large searchable table */}
              <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Lead ID</th>
                        <th>Project Type</th>
                        <th>Design Type</th>
                        <th>Requested By</th>
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
                          <td style={{ color: '#4F46E5', fontWeight: 600 }}>{getLeadId(r)}</td>
                          <td style={{ fontWeight: 600 }}>{r.projectType}</td>
                          <td>
                            <span className="badge badge-new" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                              {r.requirement === '2D Drawing' ? '2D' : r.requirement === '3D Render' ? '3D' : r.requirement}
                            </span>
                          </td>
                          <td>{r.requestedBy}</td>
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
                              <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(r); }}>Assign</button>
                              <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: 'var(--success-light)', color: 'var(--success)' }} onClick={(e) => { e.stopPropagation(); setSelectedRequest(r); updateRequestStatus('Completed', 'Approve drawings', r); }}>Approve</button>
                              <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }} onClick={(e) => { e.stopPropagation(); handleOpenRevisionModal(r); }}>Revision</button>
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
                            <button className="btn-primary" onClick={() => alert('BOQ Approved! Notification sent to Sales Manager.')}>Approve BOQ</button>
                            <button className="btn-secondary" onClick={() => alert('BOQ Rejected back to estimation engineer.')}>Request Correction</button>
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
                    {requests.filter(r => r.status === 'Pending Review').length}
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
                          <div>
                            <strong>Capacity Status:</strong> {des.workload}% workload ({des.availableCapacity} left)
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Performance Analytics</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg. completion time</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{des.avgCompletionTime}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Completed Projects</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{des.completedProjects}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Revision Rate</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{des.revisionRate}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pending Review</span>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{des.pendingReview}</div>
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
                                {requests.filter(r => r.assignedDesigner === des.name).map(r => (
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
                                {requests.filter(r => r.assignedDesigner === des.name).length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No active assignments.</td>
                                  </tr>
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
          {currentTab === 'Review Queue' && (
            <div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Waiting for Design Head Review</h3>
                
                <div className="table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Project Name</th>
                        <th>File Type</th>
                        <th>Designer</th>
                        <th>Version</th>
                        <th>Attached Files</th>
                        <th>Submission Details</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.status === 'Pending Review').map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.id}</td>
                          <td style={{ fontWeight: 600 }}>{r.projectName}</td>
                          <td>
                            <span className="badge badge-new" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                              {r.requirement}
                            </span>
                          </td>
                          <td>{r.assignedDesigner}</td>
                          <td>V1 (Initial Submittal)</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {r.attachments?.map((a, idx) => (
                                <a 
                                  key={idx} 
                                  href="#" 
                                  onClick={(e) => { e.preventDefault(); alert(`Downloading: ${a.name}`); }}
                                  style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}
                                >
                                  {a.name} ({a.size})
                                </a>
                              ))}
                            </div>
                          </td>
                          <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            CAD layout complete with anchor positions and standard truss member joints. Load analysis matches 120km/h structural wind rating.
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.7rem', width: '110px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success-light)' }} 
                                onClick={() => {
                                  setSelectedRequest(r);
                                  updateRequestStatus('Design Ready', 'Approve drawings', r);
                                }}
                              >
                                Approve Drawings
                              </button>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.7rem', width: '110px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderColor: 'var(--warning-light)' }} 
                                onClick={() => handleOpenRevisionModal(r)}
                              >
                                Revision Request
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {requests.filter(r => r.status === 'Pending Review').length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>All design sets reviewed. Queue is empty.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DRAWINGS LIBRARY */}
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
                          <button className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }} onClick={() => alert(`Downloading ${dwg.name}`)}>Download</button>
                          <button className="btn-secondary" style={{ padding: '4px', fontSize: '0.75rem' }} onClick={() => alert(`Sharing file ${dwg.name}`)}><Share2 size={12} /></button>
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
                </div>
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
                              onClick={() => alert(`Downloading document: ${doc.name}`)}
                            >
                              <Download size={12} /> Download
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
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>Mark All Read</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: !notif.read ? 'var(--primary-light)' : 'transparent', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: !notif.read ? 'var(--primary)' : 'var(--border-color)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{notif.title} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>({notif.category})</span></div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</span>
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
                  onClick={() => alert('Configuration saved successfully!')} 
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

              {activeDrawerTab === 'Requirements' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* INLINE DESIGN REQUIREMENT FORM */}
                  <div className="info-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="info-section-title" style={{ margin: 0 }}>Design Requirement Form</span>
                      {/* Tabs */}
                      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        {['Site Dimensions', 'Technical Details'].map(tab => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setReqFormTab(tab)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: reqFormTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                              border: 'none',
                              background: 'none',
                              borderBottom: reqFormTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                              cursor: 'pointer'
                            }}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                      {reqFormTab === 'Site Dimensions' ? (
                        <>
                          {/* OVERALL SITE */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Overall Site</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>PLOT LENGTH</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter length" 
                                    value={plotLength} 
                                    onChange={(e) => setPlotLength(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>PLOT WIDTH</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter width" 
                                    value={plotWidth} 
                                    onChange={(e) => setPlotWidth(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TOTAL AREA</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
                                  value={`${(parseFloat(plotLength) || 0) * (parseFloat(plotWidth) || 0)} sq ft`}
                                  disabled
                                />
                              </div>
                            </div>
                          </div>

                          {/* BUILDING AREA */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Building Area</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BUILDING LENGTH</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter length" 
                                    value={plotLength} 
                                    onChange={(e) => setPlotLength(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BUILDING WIDTH</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter width" 
                                    value={plotWidth} 
                                    onChange={(e) => setPlotWidth(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BUILDING AREA</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}
                                  value={`${(parseFloat(plotLength) || 0) * (parseFloat(plotWidth) || 0)} sq ft`}
                                  disabled
                                />
                              </div>
                            </div>
                          </div>

                          {/* ROOF SLOPE */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ROOF SLOPE</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {['Flat', '5°', '10°', '15°', '20°', 'Custom', 'Other'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setStructureGrade(opt)}
                                  style={{
                                    padding: '6px 12px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                  }}
                                >{opt}</button>
                              ))}
                            </div>
                          </div>

                          {/* STRUCTURAL LAYOUT */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Structural Layout</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BAY SPACING</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter spacing" 
                                    value={baySpacing} 
                                    onChange={(e) => setBaySpacing(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>NUMBER OF COLUMNS</label>
                                <div style={{ display: 'flex', alignItems: 'center', width: '120px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                  <button 
                                    type="button" 
                                    style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                    onClick={() => setNumColumns(prev => Math.max(1, prev - 1))}
                                  >-</button>
                                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{numColumns}</div>
                                  <button 
                                    type="button" 
                                    style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                    onClick={() => setNumColumns(prev => prev + 1)}
                                  >+</button>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>COLUMN HEIGHT</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter height" 
                                    value={columnHeight} 
                                    onChange={(e) => setColumnHeight(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>CRANE PROVISION</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setCraneProvision(opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: craneProvision === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: craneProvision === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: craneProvision === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>MEZZANINE FLOOR</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setMezzanineFloor(opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: mezzanineFloor === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: mezzanineFloor === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: mezzanineFloor === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SITE CONDITION */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Site Condition</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SOIL TYPE</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  {['Normal', 'Soft', 'Hard Rock', 'Other'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setSoilType(opt)}
                                      style={{
                                        padding: '8px 16px',
                                        border: soilType === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: soilType === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: soilType === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>GROUND LEVEL</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Level', 'Sloped', 'Other'].map(opt => {
                                    const isSelected = (opt === 'Level' && groundLevel === 'Even') || (opt === 'Sloped' && groundLevel === 'Slope') || (opt === 'Other' && groundLevel === 'Uneven');
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setGroundLevel(opt === 'Level' ? 'Even' : opt === 'Sloped' ? 'Slope' : 'Uneven')}
                                        style={{
                                          padding: '8px 16px',
                                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                          backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                          borderRadius: '6px',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          transition: 'all 0.2s'
                                        }}
                                      >{opt}</button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>FOUNDATION READY?</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setFoundationReady(opt)}
                                      style={{
                                        padding: '8px 16px',
                                        border: foundationReady === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: foundationReady === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: foundationReady === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* SECTION 1 - STRUCTURAL SPECIFICATIONS */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>SECTION 1 &mdash; STRUCTURAL SPECIFICATIONS</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>STRUCTURE GRADE</label>
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                  value={structureGrade} 
                                  onChange={(e) => setStructureGrade(e.target.value)}
                                >
                                  <option value="Standard">Standard</option>
                                  <option value="High">High Grade</option>
                                  <option value="Premium">Premium Grade</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>PURLIN TYPE</label>
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                  value={purlinType} 
                                  onChange={(e) => setPurlinType(e.target.value)}
                                >
                                  <option value="Z Purlin">Z Purlin</option>
                                  <option value="C Purlin">C Purlin</option>
                                  <option value="Sigma Purlin">Sigma Purlin</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WIND SPEED</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 45px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter wind speed" 
                                    value={windSpeed} 
                                    onChange={(e) => setWindSpeed(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>m/s</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SNOW LOAD</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 55px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="Enter snow load" 
                                    value={snowLoad} 
                                    onChange={(e) => setSnowLoad(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>kN/m²</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 2 - ROOFING & CLADDING */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>SECTION 2 &mdash; ROOFING & CLADDING</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ROOFING SHEET TYPE</label>
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                  value={roofingSheetType} 
                                  onChange={(e) => setRoofingSheetType(e.target.value)}
                                >
                                  <option value="Single Skin">Single Skin Sheet</option>
                                  <option value="Double Skin PUF">Double Skin PUF Panel</option>
                                  <option value="Standing Seam">Standing Seam Profile</option>
                                  <option value="Polycarbonate">Polycarbonate Profile</option>
                                  <option value="uPVC Sheet">uPVC Profile</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ROOFING SHEET THICKNESS</label>
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                  value={roofingSheetThickness} 
                                  onChange={(e) => setRoofingSheetThickness(e.target.value)}
                                >
                                  <option value="0.50 mm">0.50 mm</option>
                                  <option value="0.60 mm">0.60 mm</option>
                                  <option value="0.80 mm">0.80 mm</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WALL CLADDING</label>
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                  value={wallCladding} 
                                  onChange={(e) => setWallCladding(e.target.value)}
                                >
                                  <option value="PUF Panel">PUF Panel cladding</option>
                                  <option value="Galvanized Sheet">Galvanized profile cladding</option>
                                  <option value="Polycarbonate">Polycarbonate translucent cladding</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>GUTTER PROVISION</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setGutterProvision(opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: gutterProvision === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: gutterProvision === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: gutterProvision === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 3 - DOORS & WINDOWS */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>SECTION 3 &mdash; DOORS & WINDOWS</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SLIDING DOORS</label>
                                <div style={{ display: 'flex', alignItems: 'center', width: '120px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumBays(prev => Math.max(0, prev - 1))}>-</button>
                                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{numBays}</div>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumBays(prev => prev + 1)}>+</button>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>PERSONNEL DOORS</label>
                                <div style={{ display: 'flex', alignItems: 'center', width: '120px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumColumns(prev => Math.max(0, prev - 1))}>-</button>
                                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{numColumns}</div>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumColumns(prev => prev + 1)}>+</button>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WINDOW SIZE</label>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                                    placeholder="e.g. 4x3" 
                                    value={baySpacing} 
                                    onChange={(e) => setBaySpacing(e.target.value)} 
                                  />
                                  <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ft</span>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>NUMBER OF WINDOWS</label>
                                <div style={{ display: 'flex', alignItems: 'center', width: '120px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumBays(prev => Math.max(0, prev - 1))}>-</button>
                                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{numBays}</div>
                                  <button type="button" style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} onClick={() => setNumBays(prev => prev + 1)}>+</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 4 - ELECTRICAL & MECHANICAL */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>SECTION 4 &mdash; ELECTRICAL & MECHANICAL</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>LIGHTING PROVISION</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setCraneProvision(opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: craneProvision === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: craneProvision === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: craneProvision === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>EXHAUST FAN</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Yes', 'No'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setMezzanineFloor(opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: mezzanineFloor === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: mezzanineFloor === opt ? 'var(--primary-light)' : '#FFFFFF',
                                        color: mezzanineFloor === opt ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>POWER SUPPLY</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {['Available', 'Not Available'].map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setGutterProvision(opt === 'Available' ? 'Yes' : 'No')}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: (opt === 'Available' && gutterProvision === 'Yes') || (opt === 'Not Available' && gutterProvision === 'No') ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        backgroundColor: (opt === 'Available' && gutterProvision === 'Yes') || (opt === 'Not Available' && gutterProvision === 'No') ? 'var(--primary-light)' : '#FFFFFF',
                                        color: (opt === 'Available' && gutterProvision === 'Yes') || (opt === 'Not Available' && gutterProvision === 'No') ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >{opt}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* REMARKS / SPECIAL REQUIREMENTS */}
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>REMARKS / SPECIAL REQUIREMENTS</label>
                            <textarea 
                              className="form-control" 
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                              rows="3" 
                              placeholder="Any special engineering or installation requirements..."
                            ></textarea>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
                        onClick={(e) => { e.preventDefault(); alert(`Downloading file: ${file.name}`); }}
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
                          <div><strong>Old version:</strong> <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert(`Opening old version: ${rev.oldVersion}`)}>{rev.oldVersion}</span></div>
                          <div><strong>New version:</strong> <span style={{ color: 'var(--success)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert(`Opening revised version: ${rev.newVersion}`)}>{rev.newVersion}</span></div>
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

            <div className="drawer-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1, padding: '10px' }}
                onClick={() => handleOpenAssignModal(selectedRequest)}
              >
                Assign Designer
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ backgroundColor: 'var(--success)', flex: 1, padding: '10px' }} 
                onClick={() => updateRequestStatus('Approved', 'Approved drawings')}
              >
                Approve Design
              </button>
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
                      <option value="">Choose designer...</option>
                      {designers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
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
