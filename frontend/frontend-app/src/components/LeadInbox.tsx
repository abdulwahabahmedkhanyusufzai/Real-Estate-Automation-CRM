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
  X
} from 'lucide-react';

interface LeadInboxProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onToggleView: () => void;
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
  onToggleView
}) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [brokerFilter, setBrokerFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'date'>('score');
  
  // Note input state
  const [newNoteContent, setNewNoteContent] = useState('');

  // Selected Lead Object
  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || leads[0];
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

  // Urgency tag styling matching Pixxi Functional Color Coding
  const getUrgencyBadge = (urgency: Lead['urgency']) => {
    switch (urgency) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border border-rose-100 ring-1 ring-rose-100/50';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border border-amber-100 ring-1 ring-amber-100/50';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100 ring-1 ring-emerald-100/50';
      default:
        return 'bg-slate-150 text-slate-700';
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'In Progress':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Contacted':
        return 'bg-amber-50 text-amber-750 border border-amber-100';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 transition-colors duration-300 font-sans">
      
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
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-200/40 text-emerald-700 rounded-xl transition-all duration-300 text-xs font-extrabold cursor-pointer hover:shadow-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat Agent</span>
          </button>
          
          <button
            onClick={handleCreateLead}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:opacity-92 active:scale-95 text-white rounded-xl transition-all duration-250 text-xs font-black cursor-pointer shadow-sm shadow-emerald-500/10 hover:shadow"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span className="hidden sm:inline">Add Lead</span>
          </button>
        </div>
      </header>

      {/* CRM Stats Banner with Pixxi Style Rounded Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5 md:p-6 border-b bg-slate-100/40 border-slate-200/80">
        
        {/* Total Pipeline */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#01cb65] via-[#01c67d] to-[#00aed0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-slate-400 select-none">Total Pipeline</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">{stats.total}</span>
            <span className="text-[9px] font-extrabold uppercase text-slate-400">Leads</span>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#01cb65] via-[#01c67d] to-[#00aed0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-slate-400 select-none">New Enquiries</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black tracking-tight text-emerald-600">{stats.newLeads}</span>
            <span className="text-[9px] font-extrabold uppercase text-slate-400">New</span>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#01cb65] via-[#01c67d] to-[#00aed0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-slate-400 select-none">Pipe Value (Est)</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">{stats.pipelineValue}</span>
          </div>
        </div>

        {/* Avg Lead Score */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#01cb65] via-[#01c67d] to-[#00aed0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-slate-400 select-none">Avg Lead Score</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black tracking-tight flex items-center gap-1 text-[#01cb65]">
              <TrendingUp className="w-5 h-5 text-[#01cb65]" />
              {stats.avgScore}%
            </span>
          </div>
        </div>

        {/* High Urgency */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-500/20 hover:-translate-y-0.5 col-span-2 md:col-span-1">
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#01cb65] via-[#01c67d] to-[#00aed0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-left text-slate-400 select-none">High Urgency</span>
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-2xl font-black tracking-tight text-rose-600">{stats.highUrgency}</span>
            <span className="text-[9px] font-extrabold uppercase text-slate-400">Action</span>
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Area: Leads List & Filters */}
        <div className="w-full lg:w-[410px] border-r flex flex-col h-full bg-white border-slate-200/85 shrink-0">
          
          {/* Search and Sort Toolbar */}
          <div className="p-4 border-b border-slate-200/70 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads, areas, brokers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 border rounded-xl text-xs outline-none transition-all font-semibold bg-slate-50 border-slate-200 focus:border-slate-350 focus:ring-1 focus:ring-slate-100 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters select selectors */}
            <div className="flex gap-2 items-center text-xs">
              <div className="flex items-center gap-1 text-slate-450 font-extrabold shrink-0">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                <span className="text-[9px] uppercase tracking-wider select-none">Filters:</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 flex-1 select-none">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2 rounded-lg text-[10px] font-extrabold outline-none cursor-pointer transition-colors hover:bg-slate-100"
                >
                  <option value="All">All Status</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-750 py-1 px-2 rounded-lg text-[10px] font-extrabold outline-none cursor-pointer transition-colors hover:bg-slate-100"
                >
                  <option value="All">All Urgency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Broker Filter */}
                <select
                  value={brokerFilter}
                  onChange={e => setBrokerFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-755 py-1 px-2 rounded-lg text-[10px] font-extrabold outline-none cursor-pointer transition-colors hover:bg-slate-100"
                >
                  <option value="All">All Brokers</option>
                  {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                {/* Sorting options */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-emerald-50 border border-emerald-250 text-emerald-700 py-1 px-2 rounded-lg text-[10px] font-extrabold ml-auto outline-none cursor-pointer hover:bg-emerald-100/50 transition-colors"
                >
                  <option value="score">Sort: Score</option>
                  <option value="budget">Sort: Budget</option>
                  <option value="date">Sort: Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Floating Cards Scroll Area */}
          <div className="flex-1 overflow-y-auto py-3.5 divide-y-0 scrollbar-thin">
            {filteredAndSortedLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic font-semibold">
                No matching leads found
              </div>
            ) : (
              filteredAndSortedLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`mx-3.5 my-2.5 p-4 rounded-2xl flex flex-col gap-3 transition-all duration-300 cursor-pointer border text-left relative hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected 
                        ? 'bg-emerald-50/20 border-emerald-500/40 shadow shadow-emerald-500/5 ring-1 ring-emerald-500/10'
                        : 'bg-white border-slate-200/90 hover:bg-slate-50/50 hover:border-slate-350'
                    }`}
                  >
                    {/* Header: Name and Urgency */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-[13.5px] truncate tracking-tight text-slate-800">{lead.name}</h3>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${getUrgencyBadge(lead.urgency)}`}>
                        {lead.urgency}
                      </span>
                    </div>

                    {/* Meta: Budget and Score */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 font-extrabold py-0.5 px-2 rounded-md border bg-slate-55 border-slate-200/60 text-slate-850">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="tracking-tight">{lead.budget}</span>
                      </div>
                      
                      {/* Score Indicator */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold">Intent Score:</span>
                        <span className={`font-black text-xs px-1.5 py-0.25 rounded ${
                          lead.leadScore >= 90 
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/70' 
                            : lead.leadScore >= 75 
                              ? 'text-blue-750 bg-blue-50 border border-blue-100/70' 
                              : 'text-slate-550 bg-slate-50 border border-slate-200/60'
                        }`}>
                          {lead.leadScore}
                        </span>
                      </div>
                    </div>

                    {/* Area and Type */}
                    <div className="flex gap-2 text-[11px] items-center font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{lead.area}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.propertyType}</span>
                      </span>
                    </div>

                    {/* Footer: Broker and Status */}
                    <div className="flex justify-between items-center text-[10px] pt-2.5 border-t font-bold border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black border bg-slate-50 text-slate-650 border-slate-200">
                          {lead.assignedBroker[0]}
                        </span>
                        <span>Broker: <span className="text-slate-800 font-extrabold">{lead.assignedBroker}</span></span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-black tracking-wide uppercase text-[9px] ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Selected Lead Details Panel */}
        {selectedLead ? (
          <div className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-y-auto">
            {/* Lead Details Header with glowing gradient backdrop */}
            <div className="p-6 md:p-8 border-b border-slate-200/80 bg-white/95 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xs">
              <div className="flex items-center gap-5">
                {/* Big Avatar with rotating glowing border */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-0.5 rounded-full blur-sm opacity-25 group-hover:opacity-45 transition duration-500 bg-gradient-to-tr from-[#01cb65] to-[#00aed0]"></div>
                  <div className="relative w-15 h-15 rounded-full flex items-center justify-center text-lg font-black border bg-slate-50 text-slate-800 border-slate-200/90 shadow-inner">
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">{selectedLead.name}</h2>
                    <span className={`text-[9px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded border ${getStatusBadge(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-1.5 select-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Registered {selectedLead.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex gap-2.5 w-full md:w-auto">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer active:scale-95 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Call Representative</span>
                </a>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer active:scale-95 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send Mail</span>
                </a>
              </div>
            </div>

            {/* Core Info Cards */}
            <div className="p-6 md:p-8 space-y-8 max-w-5xl">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Budget */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-350 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/20">
                    <DollarSign className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">Target Budget</span>
                    <p className="text-lg font-black mt-1 tracking-tight text-slate-900">{selectedLead.budget}</p>
                  </div>
                </div>

                {/* Area */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-350 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/35">
                    <MapPin className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">Preferred Area</span>
                    <p className="text-lg font-black mt-1 tracking-tight text-slate-900">{selectedLead.area}</p>
                  </div>
                </div>

                {/* Property Type */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-350 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/35">
                    <Building2 className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">Property Type</span>
                    <p className="text-lg font-black mt-1 tracking-tight text-slate-900">{selectedLead.propertyType}</p>
                  </div>
                </div>

                {/* Lead score with glowing progress line */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-355 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/35">
                    <Sparkles className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">AI Lead Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-lg font-black tracking-tight text-slate-900">{selectedLead.leadScore}/100</p>
                      <span className="text-[9px] font-extrabold text-[#01cb65] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">High Intent</span>
                    </div>
                    {/* Glowing progress line with Pixxi brand gradient */}
                    <div className="w-full rounded-full h-1 mt-3 overflow-hidden border bg-slate-100 border-slate-200">
                      <div 
                        className="bg-gradient-to-r from-[#01cb65] to-[#00aed0] h-full rounded-full"
                        style={{ width: `${selectedLead.leadScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Urgency */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-350 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center text-emerald-650 shrink-0 border border-emerald-200/35">
                    <Clock className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">Deal Urgency</span>
                    <p className="text-lg font-black mt-1 tracking-tight flex items-center gap-2 text-slate-900">
                      <span className={`w-2.5 h-2.5 rounded-full ${selectedLead.urgency === 'High' ? 'bg-rose-500 shadow-xs' : selectedLead.urgency === 'Medium' ? 'bg-amber-500 shadow-xs' : 'bg-emerald-500 shadow-xs'}`}></span>
                      {selectedLead.urgency} Urgency
                    </p>
                  </div>
                </div>

                {/* Contact details */}
                <div className="border border-slate-200/90 rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-300 bg-white hover:border-slate-350 hover:shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0 border border-[#bbf7d0]/30">
                    <UserCheck className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest select-none">Contact details</span>
                    <p className="text-xs font-bold mt-1.5 truncate select-all text-slate-800">{selectedLead.email}</p>
                    <p className="text-[11px] mt-0.5 font-mono tracking-tight select-all text-slate-500">{selectedLead.phone}</p>
                  </div>
                </div>
              </div>

              {/* Action Controls Board (Segmented layout) */}
              <div className="border border-slate-200/90 rounded-2xl p-6 text-left bg-white shadow-xs">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-5 flex items-center gap-2 select-none">
                  <SlidersHorizontal className="w-4 h-4 text-slate-450" />
                  <span>Pipeline & Broker Assignment</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Status update selector (Premium Segmented Control in Pixxi style) */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest select-none">Lead Pipeline Status</label>
                    <div className="flex p-1 rounded-xl border w-full transition-all duration-300 bg-slate-50 border-slate-200">
                      {STATUSES.map(s => {
                        const isSelected = selectedLead.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(selectedLead.id, s as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-350 cursor-pointer ${
                              isSelected 
                                ? 'bg-gradient-to-r from-[#01cb65] to-[#00aed0] text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Broker re-assignment selection */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest select-none">Assigned Broker Agent</label>
                    <div className="relative">
                      <select
                        value={selectedLead.assignedBroker}
                        onChange={e => handleUpdateBroker(selectedLead.id, e.target.value)}
                        className="w-full py-2.5 pl-4 pr-10 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none transition-all duration-200 border bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                      >
                        {BROKERS.map(b => (
                          <option key={b} value={b}>Broker Representative: {b}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Activity Timeline Section with sleek left border timeline design */}
              <div className="text-left space-y-4">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-2 select-none">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Interaction History & Broker Logs ({selectedLead.notes.length})</span>
                </h3>

                {/* Add Note Input Area */}
                <div className="flex items-start gap-3 border rounded-xl p-3 transition-all duration-200 shadow-inner bg-white border-slate-200/90 focus-within:border-slate-400">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Log a client callback details or add critical brokerage notes..."
                    className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm py-1 resize-none font-semibold leading-relaxed text-slate-800 placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    disabled={!newNoteContent.trim()}
                    className={`p-2.5 rounded-lg transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                      newNoteContent.trim()
                        ? 'bg-gradient-to-r from-[#01cb65] to-[#00aed0] text-white shadow' 
                        : 'text-slate-350 bg-slate-100 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Notes List with visual timeline connector */}
                <div className="space-y-4.5 relative pl-4 border-l ml-3.5 mt-6 pb-2 transition-colors duration-300 border-slate-200">
                  {selectedLead.notes.map((note) => (
                    <div 
                      key={note.id}
                      className="group relative border rounded-xl p-4.5 flex flex-col gap-2.5 transition-all duration-300 hover:shadow bg-white border-slate-200/70 hover:border-slate-355"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21.5px] top-[23px] w-2 h-2 rounded-full bg-emerald-600 border border-white ring-4 ring-emerald-500/10 group-hover:scale-125 transition-transform duration-300"></div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 select-none">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border bg-slate-50 text-slate-650 border-slate-200">
                            {note.author[0]}
                          </span>
                          <span>Logged by <span className="text-slate-700 font-extrabold">{note.author}</span></span>
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-550">{note.createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {note.createdAt.toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteNote(selectedLead.id, note.id)}
                            className="transition-colors p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed font-semibold text-slate-700">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center font-bold text-xs tracking-wide italic p-8 transition-colors duration-300 bg-slate-50/50 text-slate-450">
            Select a lead from the sidebar to inspect parameters
          </div>
        )}

      </div>
    </div>
  );
};
