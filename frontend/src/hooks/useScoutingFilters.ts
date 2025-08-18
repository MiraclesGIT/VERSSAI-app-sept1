
import { useState, useEffect, useMemo } from 'react';
import { StartupType } from '@/components/StartupCard';

type SortField = 'name' | 'stage' | 'location' | 'founder' | 'industry' | 'foundedDate' | 'readinessScore';
type SortDirection = 'asc' | 'desc';
type StartupStatus = 'all' | 'recent' | 'saved' | 'approved' | 'declined';

export const useScoutingFilters = (startups: StartupType[]) => {
  const [activeTab, setActiveTab] = useState<StartupStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, stageFilter, industryFilter, sortField, sortDirection, pageSize, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Enhanced search functionality
  const searchStartups = (startups: StartupType[], query: string) => {
    if (!query.trim()) return startups;
    
    const searchTerm = query.toLowerCase();
    return startups.filter(startup => {
      const searchableFields = [
        startup.name,
        startup.founder,
        startup.stage,
        startup.location,
        startup.industry,
        startup.foundedDate
      ];
      
      return searchableFields.some(field => 
        field && field.toLowerCase().includes(searchTerm)
      );
    });
  };

  // Get unique values for filters
  const uniqueStages = useMemo(() => {
    const stages = Array.from(new Set(startups.map(s => s.stage).filter(Boolean)));
    return stages;
  }, [startups]);

  const uniqueIndustries = useMemo(() => {
    const industries = Array.from(new Set(startups.map(s => s.industry).filter(Boolean)));
    return industries;
  }, [startups]);

  // Filter and sort startups
  const filteredAndSortedStartups = useMemo(() => {
    let filtered = startups;

    // Apply search filter first
    filtered = searchStartups(filtered, searchQuery);

    // Filter by tab status
    if (activeTab !== 'all') {
      if (activeTab === 'recent') {
        filtered = filtered.filter(startup => startup.status === 'active' || !startup.status);
      } else {
        filtered = filtered.filter(startup => startup.status === activeTab);
      }
    } else {
      filtered = filtered.filter(startup => startup.status !== 'declined');
    }

    // Filter by stage
    if (stageFilter !== 'all') {
      filtered = filtered.filter(startup => startup.stage === stageFilter);
    }

    // Filter by industry
    if (industryFilter !== 'all') {
      filtered = filtered.filter(startup => startup.industry === industryFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'readinessScore') {
        aValue = a.readinessScore || 0;
        bValue = b.readinessScore || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [startups, activeTab, stageFilter, industryFilter, sortField, sortDirection, searchQuery]);

  // Pagination calculations
  const totalItems = filteredAndSortedStartups.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize);
  const startIndex = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = pageSize === -1 ? totalItems : startIndex + pageSize;
  const paginatedStartups = filteredAndSortedStartups.slice(startIndex, endIndex);

  const getStatusCounts = () => {
    const all = startups.filter(s => s.status !== 'declined').length;
    const recent = startups.filter(s => s.status === 'active' || !s.status).length;
    const saved = startups.filter(s => s.status === 'saved').length;
    const approved = startups.filter(s => s.status === 'approved').length;
    const declined = startups.filter(s => s.status === 'declined').length;
    
    return { all, recent, saved, approved, declined };
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? -1 : parseInt(value));
    setCurrentPage(1);
  };

  return {
    activeTab,
    setActiveTab,
    sortField,
    sortDirection,
    handleSort,
    stageFilter,
    setStageFilter,
    industryFilter,
    setIndustryFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    uniqueStages,
    uniqueIndustries,
    filteredAndSortedStartups,
    paginatedStartups,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    getStatusCounts
  };
};

export type { SortField, SortDirection, StartupStatus };
