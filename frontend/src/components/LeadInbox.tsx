import React, { useState, useMemo } from 'react';
import type { Lead, Note } from '../types';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Calendar,
  Menu,
  Building2,
  Sparkles,
  Trash2,
  UserCheck,
  Briefcase,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';

interface LeadInboxProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onToggleView: () => void;
  onQualifyLead?: (lead: Lead) => void;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Ahmed Khan',
    budget: 'AED 3M',
    area: 'Dubai Hills',
    propertyType: 'Villa',
    urgency: 'High',
    leadScore: 92,
    assignedBroker: 'Sarah',
    status: 'New',
    email: 'ahmed.khan@emiratesmail.ae',
    phone: '+971 50 123 4567',
    createdAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
    notes: [
      {
        id: 'note-1',
        content: 'Lead captured via WhatsApp campaign. Highly interested in standard 4-bedroom layouts in Club Villas. Ready to buy.',
        createdAt: new Date(Date.now() - 25 * 60000),
        author: 'System (AI Classifier)'
      }
    ]
  },
  {
    id: 'lead-2',
    name: 'Emily Cooper',
    budget: 'AED 1.5M',
    area: 'Dubai Marina',
    propertyType: 'Apartment',
    urgency: 'Medium',
    leadScore: 85,
    assignedBroker: 'Michael',
    status: 'In Progress',
    email: 'emily.cooper@savoir.fr',
    phone: '+971 52 987 6543',
    createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
    notes: [
      {
        id: 'note-2',
        content: 'Relocating from Paris next month. Prefers high floor in Marina Gate or Emaar 5242. Wants sunset views.',
        createdAt: new Date(Date.now() - 110 * 60000),
        author: 'Michael'
      }
    ]
  },
  {
    id: 'lead-3',
    name: 'Yasmin Al-Maktoum',
    budget: 'AED 8M',
    area: 'Palm Jumeirah',
    propertyType: 'Penthouse',
    urgency: 'High',
    leadScore: 96,
    assignedBroker: 'Sarah',
    status: 'New',
    email: 'yasmin.a@palmliving.ae',
    phone: '+971 55 555 4321',
    createdAt: new Date(Date.now() - 360 * 60000), // 6 hours ago
    notes: [
      {
        id: 'note-3',
        content: 'Looking for a secondary residence. Ultra-luxury finish is essential. Wants beachfront access and private pool.',
        createdAt: new Date(Date.now() - 350 * 60000),
        author: 'System (AI Classifier)'
      }
    ]
  },
  {
    id: 'lead-4',
    name: 'Marcus Vance',
    budget: 'AED 4.5M',
    area: 'Downtown Dubai',
    propertyType: 'Apartment',
    urgency: 'Low',
    leadScore: 72,
    assignedBroker: 'Sarah',
    status: 'Contacted',
    email: 'marcus.v@vancecorp.com',
    phone: '+1 415 889 0122',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    notes: [
      {
        id: 'note-4',
        content: 'Investor looking for high-yield properties in Downtown. Left a message, pending callback to arrange site visits.',
        createdAt: new Date(Date.now() - 80000000),
        author: 'Sarah'
      }
    ]
  },
  {
    id: 'lead-5',
    name: 'Sarah Jenkins',
    budget: 'AED 2.2M',
    area: 'Jumeirah Golf Estates',
    propertyType: 'Townhouse',
    urgency: 'Medium',
    leadScore: 78,
    assignedBroker: 'Michael',
    status: 'Closed',
    email: 'sjenkins@jge-residents.net',
    phone: '+44 7700 900077',
    createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
    notes: [
      {
        id: 'note-5',
        content: 'Deal closed successfully! Bought a 3-bed townhouse in Al Andalus. Commission verified.',
        createdAt: new Date(Date.now() - 2 * 86400000),
        author: 'Michael'
      }
    ]
  }
];

const BROKERS = ['Sarah', 'Michael', 'David', 'Jessica'];
const STATUSES = ['New', 'In Progress', 'Contacted', 'Closed'];

export const LeadInbox: React.FC<LeadInboxProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onToggleView,
  onQualifyLead
}) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [brokerFilter, setBrokerFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'date'>('score');
  
  // Custom dropdowns state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isUrgencyDropdownOpen, setIsUrgencyDropdownOpen] = useState(false);
  const [isBrokerDropdownOpen, setIsBrokerDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isDrawerBrokerDropdownOpen, setIsDrawerBrokerDropdownOpen] = useState(false);

  // Note input state
  const [newNoteContent, setNewNoteContent] = useState('');

  // Selected Lead Object
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Handle properties changes
  const handleUpdateStatus = (leadId: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const handleUpdateBroker = (leadId: string, assignedBroker: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedBroker } : l));
  };

  const handleAddNote = (leadId: string) => {
    if (!newNoteContent.trim()) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date(),
      author: 'Active Broker'
    };
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          notes: [newNote, ...l.notes]
        };
      }
      return l;
    }));
    setNewNoteContent('');
  };

  const handleDeleteNote = (leadId: string, noteId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          notes: l.notes.filter(n => n.id !== noteId)
        };
      }
      return l;
    }));
  };

  // Add a new mock lead
  const handleCreateLead = () => {
    const names = ['Amina Al-Fahim', 'David Miller', 'Rami Haddad', 'Chloe Thompson'];
    const budgets = ['AED 5.2M', 'AED 1.8M', 'AED 6.5M', 'AED 950K'];
    const areas = ['Downtown Dubai', 'Palm Jumeirah', 'Dubai Hills', 'JVC'];
    const propTypes = ['Villa', 'Apartment', 'Penthouse', 'Townhouse'];
    const urgencies: Lead['urgency'][] = ['High', 'Medium', 'Low'];
    const brokers = ['Sarah', 'Michael', 'David', 'Jessica'];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomBudget = budgets[Math.floor(Math.random() * budgets.length)];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    const randomPropType = propTypes[Math.floor(Math.random() * propTypes.length)];
    const randomUrgency = urgencies[Math.floor(Math.random() * urgencies.length)];
    const randomBroker = brokers[Math.floor(Math.random() * brokers.length)];
    const randomScore = Math.floor(Math.random() * 41) + 60; // 60-100

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: randomName,
      budget: randomBudget,
      area: randomArea,
      propertyType: randomPropType,
      urgency: randomUrgency,
      leadScore: randomScore,
      assignedBroker: randomBroker,
      status: 'New',
      email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: `+971 50 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date(),
      notes: [
        {
          id: `note-${Date.now()}`,
          content: `Lead created automatically. Interested in ${randomPropType} in ${randomArea}. Score calculated as ${randomScore}.`,
          createdAt: new Date(),
          author: 'System'
        }
      ]
    };

    setLeads(prev => [newLead, ...prev]);
    setSelectedLeadId(newLead.id);
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const highUrgency = leads.filter(l => l.urgency === 'High').length;
    
    // Average score
    const avgScore = total > 0 ? Math.round(leads.reduce((acc, curr) => acc + curr.leadScore, 0) / total) : 0;
    
    // Pipe value calculation helper (mock sum of budgets)
    let totalVal = 0;
    leads.forEach(l => {
      const num = parseFloat(l.budget.replace(/[^0-9.]/g, ''));
      if (l.budget.includes('M')) {
        totalVal += num;
      } else if (l.budget.includes('K')) {
        totalVal += num / 1000;
      }
    });

    return {
      total,
      newLeads,
      highUrgency,
      avgScore,
      pipelineValue: `AED ${totalVal.toFixed(1)}M`
    };
  }, [leads]);

  // Filter and Sort leads
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter(lead => {
        // Search
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.propertyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.assignedBroker.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filters
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        const matchesUrgency = urgencyFilter === 'All' || lead.urgency === urgencyFilter;
        const matchesBroker = brokerFilter === 'All' || lead.assignedBroker === brokerFilter;

        return matchesSearch && matchesStatus && matchesUrgency && matchesBroker;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.leadScore - a.leadScore;
        }
        if (sortBy === 'date') {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        if (sortBy === 'budget') {
          const valA = parseFloat(a.budget.replace(/[^0-9.]/g, '')) * (a.budget.includes('M') ? 1000 : 1);
          const valB = parseFloat(b.budget.replace(/[^0-9.]/g, '')) * (b.budget.includes('M') ? 1000 : 1);
          return valB - valA;
        }
        return 0;
      });
  }, [leads, searchQuery, statusFilter, urgencyFilter, brokerFilter, sortBy]);

  // Generate avatar gradient based on lead name
  const getAvatarGradient = (name: string) => {
    const charCode = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
    const grads = [
      'from-emerald-400 to-teal-500 text-white',
      'from-blue-400 to-indigo-500 text-white',
      'from-violet-400 to-purple-500 text-white',
      'from-amber-400 to-orange-500 text-white',
      'from-rose-450 to-pink-500 text-white'
    ];
    return grads[charCode % grads.length];
  };

  // Render Status Badge with dot indicator
  const renderStatusBadge = (status: Lead['status']) => {
    const dotColor = {
      'New': 'bg-blue-500',
      'In Progress': 'bg-purple-500',
      'Contacted': 'bg-amber-500',
      'Closed': 'bg-emerald-500'
    }[status] || 'bg-slate-400';

    const classes = {
      'New': 'bg-blue-50 text-blue-700 border border-blue-150',
      'In Progress': 'bg-purple-50 text-purple-700 border border-purple-150',
      'Contacted': 'bg-amber-50 text-amber-800 border border-amber-200',
      'Closed': 'bg-emerald-50 text-emerald-700 border border-emerald-150'
    }[status] || 'bg-slate-50 text-slate-600 border border-slate-150';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{status}</span>
      </span>
    );
  };

  // Render Urgency Badge with dot indicator
  const renderUrgencyBadge = (urgency: Lead['urgency']) => {
    const dotColor = {
      'High': 'bg-rose-500 animate-pulse',
      'Medium': 'bg-amber-500',
      'Low': 'bg-emerald-500'
    }[urgency];

    const classes = {
      'High': 'bg-rose-50 text-rose-700 border border-rose-150',
      'Medium': 'bg-amber-50 text-amber-700 border border-amber-200',
      'Low': 'bg-emerald-50 text-emerald-750 border border-emerald-150'
    }[urgency];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{urgency}</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 transition-colors duration-300 font-sans overflow-hidden">
      
      {/* Pixxi Styled Header with logo and green gradient elements */}
      <header className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col text-left">
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2 select-none text-slate-900">
              <span className="p-1.5 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="font-extrabold text-slate-900">pixxi</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 ml-1">CRM</span>
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-400">Dubai Real Estate Dashboard</span>
          </div>
        </div>

        {/* View Switcher and Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleView}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-200/40 text-emerald-700 rounded-xl transition-all duration-300 text-xs font-extrabold cursor-pointer hover:shadow-xs active:scale-95 animate-pulse-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat Agent</span>
          </button>
          
          <button
            onClick={handleCreateLead}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:opacity-92 active:scale-95 text-white rounded-xl transition-all duration-250 text-xs font-black cursor-pointer shadow-sm shadow-emerald-500/10 hover:shadow"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      {/* CRM Stats Banner with Custom Left Border & Diagnostic Icons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5 md:p-6 border-b bg-slate-100/40 border-slate-200/80 shrink-0 animate-fade-in-up">
        
        {/* Total Pipeline */}
        <div className="bg-white border-l-4 border-l-[#01cb65] border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 select-none">Total Pipeline</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">{stats.total}</span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400">Leads</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-[#01cb65] rounded-xl border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white border-l-4 border-l-blue-500 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 select-none">New Enquiries</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-xl font-black tracking-tight text-blue-600">{stats.newLeads}</span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400">New</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white border-l-4 border-l-indigo-500 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 select-none">Pipeline Value (Est)</span>
            <div className="flex items-baseline mt-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">{stats.pipelineValue}</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Avg Lead Score */}
        <div className="bg-white border-l-4 border-l-teal-500 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 select-none">Avg Lead Score</span>
            <div className="flex items-baseline mt-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">{stats.avgScore}%</span>
            </div>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/50 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* High Urgency */}
        <div className="bg-white border-l-4 border-l-rose-500 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group col-span-2 md:col-span-1">
          <div className="text-left">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 select-none">High Urgency</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-xl font-black tracking-tight text-rose-600">{stats.highUrgency}</span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400">Action</span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50 group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

      </div>

      {/* Main Board Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 animate-scale-in">
        
        {/* Search, Filter & Action Toolbar */}
        <div className="p-5 border-b border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client name, area, property type or broker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border rounded-xl text-xs outline-none transition-all font-semibold bg-[#f8fafc] border-slate-200 focus:border-[#01cb65] focus:ring-1 focus:ring-[#01cb65]/10 text-slate-800 placeholder-slate-400 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtering Selectors (Custom Dropdowns) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-400 font-extrabold shrink-0 uppercase tracking-wider text-[9px] mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              
              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsUrgencyDropdownOpen(false);
                    setIsBrokerDropdownOpen(false);
                    setIsSortDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl text-[11px] font-bold outline-none cursor-pointer hover:border-slate-350 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <span>Status: {statusFilter === 'All' ? 'All' : statusFilter}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isStatusDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsStatusDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-1.5 animate-scale-in text-left">
                      <button
                        onClick={() => { setStatusFilter('All'); setIsStatusDropdownOpen(false); }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                          statusFilter === 'All' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'hover:bg-slate-50 text-slate-650'
                        }`}
                      >
                        All Statuses
                      </button>
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                            statusFilter === s ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'hover:bg-slate-50 text-slate-655'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Urgency Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUrgencyDropdownOpen(!isUrgencyDropdownOpen);
                    setIsStatusDropdownOpen(false);
                    setIsBrokerDropdownOpen(false);
                    setIsSortDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl text-[11px] font-bold outline-none cursor-pointer hover:border-slate-350 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <span>Urgency: {urgencyFilter === 'All' ? 'All' : urgencyFilter}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUrgencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUrgencyDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUrgencyDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-1.5 animate-scale-in text-left">
                      {['All', 'High', 'Medium', 'Low'].map(u => (
                        <button
                          key={u}
                          onClick={() => { setUrgencyFilter(u); setIsUrgencyDropdownOpen(false); }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                            urgencyFilter === u ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'hover:bg-slate-50 text-slate-650'
                          }`}
                        >
                          {u === 'All' ? 'All Urgencies' : `${u} Urgency`}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Broker Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsBrokerDropdownOpen(!isBrokerDropdownOpen);
                    setIsStatusDropdownOpen(false);
                    setIsUrgencyDropdownOpen(false);
                    setIsSortDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl text-[11px] font-bold outline-none cursor-pointer hover:border-slate-350 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <span>Broker: {brokerFilter === 'All' ? 'All' : brokerFilter}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isBrokerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isBrokerDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsBrokerDropdownOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-1.5 animate-scale-in text-left">
                      <button
                        onClick={() => { setBrokerFilter('All'); setIsBrokerDropdownOpen(false); }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                          brokerFilter === 'All' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'hover:bg-slate-50 text-slate-655'
                        }`}
                      >
                        All Brokers
                      </button>
                      {BROKERS.map(b => (
                        <button
                          key={b}
                          onClick={() => { setBrokerFilter(b); setIsBrokerDropdownOpen(false); }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                            brokerFilter === b ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'hover:bg-slate-50 text-slate-650'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sort By Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                    setIsStatusDropdownOpen(false);
                    setIsUrgencyDropdownOpen(false);
                    setIsBrokerDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 py-1.5 px-3 rounded-xl text-[11px] font-extrabold outline-none cursor-pointer hover:bg-emerald-100/50 transition-all shadow-xs"
                >
                  <span>Sort: {sortBy === 'score' ? 'Intent Score' : sortBy === 'budget' ? 'Budget' : 'Date Added'}</span>
                  <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsSortDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-1.5 animate-scale-in text-left">
                      {[
                        { value: 'score', label: 'Intent Score' },
                        { value: 'budget', label: 'Budget' },
                        { value: 'date', label: 'Date Added' }
                      ].map(item => (
                        <button
                          key={item.value}
                          onClick={() => { setSortBy(item.value as 'score' | 'budget' | 'date'); setIsSortDropdownOpen(false); }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                            sortBy === item.value ? 'bg-emerald-50 text-emerald-750 font-extrabold' : 'hover:bg-slate-50 text-slate-650'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Dashboard leads list content */}
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400 text-center">
              <span className="p-3 bg-slate-100 rounded-full mb-3">
                <Briefcase className="w-6 h-6 text-slate-350" />
              </span>
              <p className="text-xs font-extrabold">No matching leads found</p>
              <p className="text-[10px] text-slate-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-wider text-slate-450 select-none">
                      <th className="py-4 px-6">Client Info</th>
                      <th className="py-4 px-4">Requirements</th>
                      <th className="py-4 px-4 text-center">AI Intent</th>
                      <th className="py-4 px-4 text-center">Urgency</th>
                      <th className="py-4 px-4">Assigned Representative</th>
                      <th className="py-4 px-4">Pipeline Status</th>
                      <th className="py-4 px-4">Date Added</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAndSortedLeads.map((lead) => (
                      <tr 
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          // Close any active filter dropdowns
                          setIsStatusDropdownOpen(false);
                          setIsUrgencyDropdownOpen(false);
                          setIsBrokerDropdownOpen(false);
                          setIsSortDropdownOpen(false);
                        }}
                        className="group hover:bg-emerald-50/5 transition-colors duration-150 cursor-pointer"
                      >
                        {/* Client Info with custom gradient avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(lead.name)} flex items-center justify-center text-xs font-black shadow-inner`}>
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#01cb65] transition-colors">{lead.name}</span>
                              <span className="text-[10.5px] text-slate-450 mt-0.5 leading-none">{lead.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Requirements */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 text-xs text-left">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {lead.area}
                            </span>
                            <span className="text-[10.5px] text-slate-450 font-medium">
                              {lead.propertyType} • <span className="font-extrabold text-emerald-600">{lead.budget}</span>
                            </span>
                          </div>
                        </td>

                        {/* AI Intent score circle / badge */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-1.5 justify-center">
                            <span className={`font-black text-[10.5px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              lead.leadScore >= 90 
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' 
                                : lead.leadScore >= 75 
                                  ? 'text-blue-700 bg-blue-50 border border-blue-200/60' 
                                  : 'text-slate-600 bg-slate-50 border border-slate-200/60'
                            }`}>
                              <Sparkles className="w-3 h-3 text-current" />
                              {lead.leadScore}
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden border border-slate-200/60">
                              <div 
                                className="bg-gradient-to-r from-[#01cb65] to-[#00aed0] h-full rounded-full"
                                style={{ width: `${lead.leadScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Urgency */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            {renderUrgencyBadge(lead.urgency)}
                          </div>
                        </td>

                        {/* Broker representative info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5 text-xs text-left">
                            <span className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-black border bg-slate-50 text-slate-650 border-slate-200 shadow-2xs">
                              {lead.assignedBroker[0]}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{lead.assignedBroker}</span>
                              <span className="text-[9px] text-slate-400 font-medium">Broker Agent</span>
                            </div>
                          </div>
                        </td>

                        {/* Pipeline Status */}
                        <td className="py-4 px-4 text-left">
                          {renderStatusBadge(lead.status)}
                        </td>

                        {/* Date Added */}
                        <td className="py-4 px-4 text-left">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {onQualifyLead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQualifyLead(lead);
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Qualify with AI Chat"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadId(lead.id);
                              }}
                              className="px-3 py-1 text-[11px] font-black text-[#01cb65] bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden flex flex-col gap-3.5 p-4">
                {filteredAndSortedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col gap-3 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {/* Header: Name, Score and Status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarGradient(lead.name)} flex items-center justify-center text-xs font-black`}>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col text-left">
                          <h4 className="font-extrabold text-sm text-slate-900">{lead.name}</h4>
                          <span className="text-[10px] text-slate-450">{lead.email}</span>
                        </div>
                      </div>
                      {renderStatusBadge(lead.status)}
                    </div>

                    {/* Details requirements grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-left">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Budget</span>
                        <span className="text-xs font-black text-emerald-600">{lead.budget}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Location</span>
                        <span className="text-xs font-extrabold text-slate-800 truncate">{lead.area}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Type</span>
                        <span className="text-xs font-bold text-slate-650">{lead.propertyType}</span>
                      </div>
                    </div>

                    {/* Footer: Score, Urgency, Broker */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400">Score:</span>
                        <span className={`font-black text-[10px] px-2 py-0.25 rounded-full inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-100`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {lead.leadScore}
                        </span>
                      </div>
                      {renderUrgencyBadge(lead.urgency)}
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full border bg-slate-50 text-[8px] flex items-center justify-center font-black text-slate-600">
                          {lead.assignedBroker[0]}
                        </span>
                        <span>{lead.assignedBroker}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Slide-Over Drawer */}
      {selectedLead && (
        <>
          {/* Backdrop with fade-in and blur */}
          <div 
            onClick={() => {
              setSelectedLeadId(null);
              setIsDrawerBrokerDropdownOpen(false);
            }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-all duration-300 animate-in fade-in"
          />
          
          {/* Drawer Panel with slide-in from right */}
          <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[650px] bg-white shadow-2xl border-l border-slate-200/90 flex flex-col h-full overflow-hidden animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="px-6 py-5.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3.5 text-left">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getAvatarGradient(selectedLead.name)} flex items-center justify-center text-sm font-black shadow-inner`}>
                  {selectedLead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">{selectedLead.name}</h2>
                  <span className="text-[10px] text-slate-400 font-bold">Registered {selectedLead.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedLeadId(null);
                  setIsDrawerBrokerDropdownOpen(false);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-450 hover:text-slate-850 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Quick Contact & Qualification Actions */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 bg-white hover:bg-slate-50 text-slate-700 border-slate-205 hover:shadow-xs active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Call Lead</span>
                </a>
                
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 bg-white hover:bg-slate-50 text-slate-700 border-slate-205 hover:shadow-xs active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Lead</span>
                </a>

                {onQualifyLead && (
                  <button
                    onClick={() => {
                      onQualifyLead(selectedLead);
                      setSelectedLeadId(null);
                      setIsDrawerBrokerDropdownOpen(false);
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-250 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:opacity-90 text-white shadow-sm hover:shadow active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Qualification</span>
                  </button>
                )}
              </div>

              {/* Requirements Section Header */}
              <div className="text-left">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 select-none mb-3">Primary Client Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Target Budget */}
                  <div className="border border-slate-150 rounded-2xl p-4 text-left flex items-start gap-3 bg-slate-50/40 hover:shadow-xs transition-shadow">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Target Budget</span>
                      <p className="text-sm font-black mt-0.5 tracking-tight text-slate-900">{selectedLead.budget}</p>
                    </div>
                  </div>

                  {/* Area */}
                  <div className="border border-slate-150 rounded-2xl p-4 text-left flex items-start gap-3 bg-slate-50/40 hover:shadow-xs transition-shadow">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Preferred Area</span>
                      <p className="text-sm font-black mt-0.5 tracking-tight text-slate-900">{selectedLead.area}</p>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="border border-slate-150 rounded-2xl p-4 text-left flex items-start gap-3 bg-slate-50/40 hover:shadow-xs transition-shadow">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Property Type</span>
                      <p className="text-sm font-black mt-0.5 tracking-tight text-slate-900">{selectedLead.propertyType}</p>
                    </div>
                  </div>

                  {/* Lead Urgency */}
                  <div className="border border-slate-150 rounded-2xl p-4 text-left flex items-start gap-3 bg-slate-50/40 hover:shadow-xs transition-shadow">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Deal Urgency</span>
                      <p className="text-sm font-black mt-0.5 tracking-tight text-slate-900 flex items-center gap-1.5">
                        {renderUrgencyBadge(selectedLead.urgency)}
                      </p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="border border-slate-150 rounded-2xl p-4 text-left flex items-start gap-3 bg-slate-50/40 hover:shadow-xs transition-shadow col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-650 border border-slate-200 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest font-sans">Contact Details</span>
                      <p className="text-xs font-bold mt-1 text-slate-800 select-all truncate">{selectedLead.email}</p>
                      <p className="text-[10px] mt-0.5 font-mono tracking-tight text-slate-500 select-all">{selectedLead.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Intent Score Card */}
              <div className="border border-slate-200/80 rounded-2xl p-5 text-left bg-gradient-to-r from-emerald-50/15 to-blue-50/15 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-[#01cb65] animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800">AI Intent & Qualification Score</span>
                  </div>
                  <span className="text-lg font-black text-slate-950">{selectedLead.leadScore}/100</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on engagement frequency, budget match, and response sentiment analysis.</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-200/60">
                  <div 
                    className="bg-gradient-to-r from-[#01cb65] to-[#00aed0] h-full rounded-full"
                    style={{ width: `${selectedLead.leadScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Pipeline & Broker Settings */}
              <div className="border border-slate-200/95 rounded-2xl p-5 text-left bg-white shadow-xs space-y-4 animate-scale-in">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workflow Parameters</span>
                </h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Lead Pipeline Status</label>
                  <div className="flex p-0.5 rounded-lg border w-full bg-slate-50 border-slate-150">
                    {STATUSES.map(s => {
                      const isSelected = selectedLead.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(selectedLead.id, s as 'New' | 'In Progress' | 'Contacted' | 'Closed')}
                          className={`flex-1 py-1.5 text-[10.5px] font-extrabold rounded-md transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-gradient-to-r from-[#01cb65] to-[#00aed0] text-white shadow-xs'
                              : 'text-slate-550 hover:text-slate-850 hover:bg-slate-100/50'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Broker Custom Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Assigned Broker Agent</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsDrawerBrokerDropdownOpen(!isDrawerBrokerDropdownOpen)}
                      className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-bold outline-none border bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 transition-all cursor-pointer text-left shadow-xs"
                    >
                      <span>Broker Representative: {selectedLead.assignedBroker}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDrawerBrokerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDrawerBrokerDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDrawerBrokerDropdownOpen(false)} />
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-scale-in text-left">
                          {BROKERS.map(b => (
                            <button
                              key={b}
                              onClick={() => {
                                handleUpdateBroker(selectedLead.id, b);
                                setIsDrawerBrokerDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                                selectedLead.assignedBroker === b ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              Broker Representative: {b}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Interaction History & Notes */}
              <div className="text-left space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none pl-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Interaction Logs ({selectedLead.notes.length})</span>
                </h3>

                {/* Add Note Input Area */}
                <div className="flex items-start gap-2 border rounded-xl p-3 shadow-inner bg-white border-slate-200 focus-within:border-slate-400">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Log a client callback details or add critical brokerage notes..."
                    className="flex-1 bg-transparent border-0 outline-none text-xs py-1 resize-none font-semibold leading-relaxed text-slate-800 placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    disabled={!newNoteContent.trim()}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      newNoteContent.trim()
                        ? 'bg-gradient-to-r from-[#01cb65] to-[#00aed0] text-white shadow' 
                        : 'text-slate-300 bg-slate-100 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Notes List with visual timeline connector */}
                <div className="space-y-4 relative pl-3.5 border-l ml-3.5 mt-4 pb-2 border-slate-200">
                  {selectedLead.notes.map((note) => (
                    <div 
                      key={note.id}
                      className="group relative border border-slate-150/80 rounded-xl p-3.5 flex flex-col gap-2 transition-all hover:shadow bg-white hover:border-slate-300 animate-scale-in"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[20px] top-[18px] w-2.5 h-2.5 rounded-full bg-emerald-650 border border-white ring-4 ring-emerald-500/10 group-hover:scale-110 transition-transform"></div>

                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 select-none">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[7.5px] font-black border bg-slate-50 text-slate-655 border-slate-200">
                            {note.author[0]}
                          </span>
                          <span>Logged by <span className="text-slate-700 font-extrabold">{note.author}</span></span>
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-450">
                            {note.createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {note.createdAt.toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(selectedLead.id, note.id);
                            }}
                            className="transition-colors p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed font-semibold text-slate-700">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
