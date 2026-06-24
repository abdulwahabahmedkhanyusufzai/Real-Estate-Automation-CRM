import React, { useState, useMemo } from 'react';
import type { Lead, Note } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  User,
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
  ChevronRight,
  Menu,
  Building2,
  Sparkles,
  Trash2,
  UserCheck,
  CheckCircle,
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

  // Priority color formatting
  const getUrgencyBadge = (urgency: Lead['urgency']) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border border-red-500/25';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'In Progress':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'Contacted':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'Closed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] relative overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2f3032] bg-[#131314]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <span>Brokerage CRM</span>
            </h1>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-widest font-sans">Lead Management</span>
          </div>
        </div>

        {/* View Switcher Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleView}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl transition-all text-xs font-semibold cursor-pointer shadow-lg shadow-blue-900/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat Agent</span>
          </button>
          
          <button
            onClick={handleCreateLead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Lead</span>
          </button>
        </div>
      </header>

      {/* CRM Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 md:p-6 border-b border-[#2f3032] bg-[#1a1b1c]/30">
        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Pipeline</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-[10px] text-zinc-500">Leads</span>
          </div>
        </div>

        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">New Enquiries</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-bold text-blue-400">{stats.newLeads}</span>
            <span className="text-[10px] text-zinc-500">Pending review</span>
          </div>
        </div>

        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pipe Value (Est)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-bold text-emerald-400">{stats.pipelineValue}</span>
          </div>
        </div>

        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Lead Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {stats.avgScore}%
            </span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">High Urgency</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-bold text-rose-400">{stats.highUrgency}</span>
            <span className="text-[10px] text-zinc-500">Action needed</span>
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Area: Leads List & Filters */}
        <div className="w-full lg:w-[420px] border-r border-[#2f3032] flex flex-col h-full bg-[#18191a]/40 shrink-0">
          
          {/* Search and Sort Toolbar */}
          <div className="p-4 border-b border-[#2f3032] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads, areas, brokers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1e1f20] border border-[#2f3032] focus:border-zinc-700 rounded-xl text-sm outline-none text-zinc-150 placeholder-zinc-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills / Selectors */}
            <div className="flex gap-2 items-center text-xs">
              <div className="flex items-center gap-1 text-zinc-400 font-medium">
                <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
                <span>Filters:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1 select-none">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#1e1f20] border border-[#2f3032] hover:border-zinc-700 text-zinc-300 py-1 px-2 rounded-lg text-[11px] font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="bg-[#1e1f20] border border-[#2f3032] hover:border-zinc-700 text-zinc-300 py-1 px-2 rounded-lg text-[11px] font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Urgency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Sorting options */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 py-1 px-2 rounded-lg text-[11px] font-semibold ml-auto outline-none cursor-pointer"
                >
                  <option value="score">Sort: Lead Score</option>
                  <option value="budget">Sort: Budget</option>
                  <option value="date">Sort: Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2f3032]/60 scrollbar-thin">
            {filteredAndSortedLeads.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm italic">
                No matching leads found
              </div>
            ) : (
              filteredAndSortedLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-4 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer text-left relative ${
                      isSelected 
                        ? 'bg-[#1e2330] border-l-4 border-blue-500' 
                        : 'hover:bg-zinc-800/35 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Header: Name and Urgency */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-zinc-100 text-[15px] truncate">{lead.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getUrgencyBadge(lead.urgency)}`}>
                        {lead.urgency} Urgency
                      </span>
                    </div>

                    {/* Meta: Budget and Score */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-zinc-300 font-semibold bg-zinc-800/60 py-0.5 px-2 rounded-md">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{lead.budget}</span>
                      </div>
                      
                      {/* Score Indicator */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 text-[11px]">Score:</span>
                        <span className={`font-bold text-sm ${lead.leadScore >= 90 ? 'text-emerald-400' : lead.leadScore >= 75 ? 'text-blue-400' : 'text-zinc-400'}`}>
                          {lead.leadScore}
                        </span>
                      </div>
                    </div>

                    {/* Area and Type */}
                    <div className="flex gap-2 text-xs text-zinc-400 items-center">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{lead.area}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{lead.propertyType}</span>
                      </span>
                    </div>

                    {/* Footer: Broker and Status */}
                    <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-[#2f3032]/40 text-zinc-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center text-[9px] text-zinc-300 font-bold">
                          {lead.assignedBroker[0]}
                        </span>
                        <span>Broker: <span className="text-zinc-300 font-semibold">{lead.assignedBroker}</span></span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${getStatusBadge(lead.status)}`}>
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
          <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-y-auto">
            {/* Lead Details Banner */}
            <div className="p-6 md:p-8 border-b border-[#2f3032] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1b1c]/10">
              <div className="flex items-center gap-4">
                {/* Big Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-900/10">
                  {selectedLead.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-bold text-white">{selectedLead.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Captured on {selectedLead.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex gap-2 w-full md:w-auto">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Call Client</span>
                </a>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Email Client</span>
                </a>
              </div>
            </div>

            {/* Core Info Cards */}
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Target Budget</span>
                    <p className="text-lg font-bold text-white mt-0.5">{selectedLead.budget}</p>
                  </div>
                </div>

                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Preferred Area</span>
                    <p className="text-lg font-bold text-white mt-0.5">{selectedLead.area}</p>
                  </div>
                </div>

                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Property Type</span>
                    <p className="text-lg font-bold text-white mt-0.5">{selectedLead.propertyType}</p>
                  </div>
                </div>

                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">AI Lead Score</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-lg font-bold text-white">{selectedLead.leadScore}/100</p>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/10">High Intent</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <Clock className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Purchase Urgency</span>
                    <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${selectedLead.urgency === 'High' ? 'bg-red-500' : selectedLead.urgency === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {selectedLead.urgency}
                    </p>
                  </div>
                </div>

                <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-4.5 text-left flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Contact Info</span>
                    <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">{selectedLead.email}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{selectedLead.phone}</p>
                  </div>
                </div>
              </div>

              {/* Action Controls Board */}
              <div className="bg-[#1a1b1c]/30 border border-[#2f3032] rounded-2xl p-6 text-left">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                  <span>Lead Pipeline Controls</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Status update selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400">Pipeline Status</label>
                    <div className="flex gap-2">
                      {STATUSES.map(s => {
                        const isSelected = selectedLead.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(selectedLead.id, s as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/10'
                                : 'bg-[#1e1f20] border-[#2f3032] hover:border-zinc-800 text-zinc-300'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Broker re-assignment selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400">Assign Broker</label>
                    <select
                      value={selectedLead.assignedBroker}
                      onChange={e => handleUpdateBroker(selectedLead.id, e.target.value)}
                      className="w-full bg-[#1e1f20] border border-[#2f3032] hover:border-zinc-700 py-2.5 px-4 rounded-xl text-xs font-bold outline-none text-zinc-200 cursor-pointer"
                    >
                      {BROKERS.map(b => (
                        <option key={b} value={b}>Broker: {b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes and Activity Timeline Section */}
              <div className="text-left space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Broker Interactions & Notes ({selectedLead.notes.length})</span>
                </h3>

                {/* Add Note Input Area */}
                <div className="flex items-start gap-3 bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-3 focus-within:border-zinc-600 transition-all">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Write a follow-up log or broker note here..."
                    className="flex-1 bg-transparent border-0 outline-none text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm py-1 resize-none font-medium leading-relaxed"
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    disabled={!newNoteContent.trim()}
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      newNoteContent.trim()
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'text-zinc-600 bg-zinc-800/40 cursor-not-allowed'
                    }`}
                    title="Save note"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3.5 mt-4">
                  {selectedLead.notes.map((note) => (
                    <div 
                      key={note.id}
                      className="bg-[#1a1b1c]/55 border border-[#2f3032]/60 rounded-xl p-4 flex flex-col gap-2 hover:border-zinc-800 transition-all"
                    >
                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500">
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center text-[8px] text-zinc-400 font-bold">
                            {note.author[0]}
                          </span>
                          <span>Logged by <span className="text-zinc-300 font-bold">{note.author}</span></span>
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span>{note.createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {note.createdAt.toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteNote(selectedLead.id, note.id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-0.5 rounded-md hover:bg-zinc-800"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 italic p-8">
            Select a lead from the sidebar to inspect parameters
          </div>
        )}

      </div>
    </div>
  );
};
