
import React, { useState } from 'react';
import Header from '@/components/Header';
import StartupFilters from '@/components/startup/StartupFilters';
import ScoutingTabs from '@/components/scouting/ScoutingTabs';
import ScoutingTable from '@/components/scouting/ScoutingTable';
import ScoutingPagination from '@/components/scouting/ScoutingPagination';
import ScoutingActions from '@/components/scouting/ScoutingActions';
import ScoutingModals from '@/components/scouting/ScoutingModals';
import ScoutingLoadingState from '@/components/scouting/ScoutingLoadingState';
import { useScoutingData } from '@/hooks/useScoutingData';
import { useScoutingFilters } from '@/hooks/useScoutingFilters';
import { useScoutingUpload } from '@/hooks/useScoutingUpload';

const Scouting = () => {
  const [isAddStartupModalOpen, setIsAddStartupModalOpen] = useState(false);

  // Use custom hooks for data and filters
  const {
    startups,
    isLoading,
    editingStartupId,
    generatingScoreIds,
    generatingBasicDDIds,
    handleGenerateScore,
    handleGenerateBasicDD,
    handleStatusChange,
    handleEditDetails,
    handleSaveDetails,
    handleCancelEdit,
    handleAddStartup,
    loadStartups
  } = useScoutingData();

  const {
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
  } = useScoutingFilters(startups);

  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isBulkUploading,
    uploadProgress,
    isSingleUploadModalOpen,
    setIsSingleUploadModalOpen,
    selectedStartupId,
    isSingleUploading,
    handleBulkUpload,
    handleUploadDeck,
    handleSingleUpload
  } = useScoutingUpload(loadStartups);

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return <ScoutingLoadingState />;
  }

  return (
    <div className="px-4 py-6 max-w-full overflow-hidden">
      <Header 
        title="Startups" 
        subtitle="Browse and manage startups" 
        actions={
          <ScoutingActions
            onAddStartup={() => setIsAddStartupModalOpen(true)}
            onUploadDecks={() => setIsUploadModalOpen(true)}
          />
        }
      />
      
      <ScoutingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        statusCounts={statusCounts}
      >
        <StartupFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          uniqueStages={uniqueStages}
          uniqueIndustries={uniqueIndustries}
          totalCount={startups.length}
          filteredCount={filteredAndSortedStartups.length}
        />

        <ScoutingTable
          startups={paginatedStartups}
          editingStartupId={editingStartupId}
          generatingScoreIds={generatingScoreIds}
          generatingBasicDDIds={generatingBasicDDIds}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onStatusChange={handleStatusChange}
          onEditDetails={handleEditDetails}
          onSaveDetails={handleSaveDetails}
          onCancelEdit={handleCancelEdit}
          onGenerateScore={handleGenerateScore}
          onUploadDeck={handleUploadDeck}
          onGenerateBasicDD={handleGenerateBasicDD}
        />
        
        <ScoutingPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </ScoutingTabs>
      
      <ScoutingModals
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        onBulkUpload={handleBulkUpload}
        isBulkUploading={isBulkUploading}
        uploadProgress={uploadProgress}
        isSingleUploadModalOpen={isSingleUploadModalOpen}
        setIsSingleUploadModalOpen={setIsSingleUploadModalOpen}
        selectedStartupId={selectedStartupId}
        onSingleUpload={handleSingleUpload}
        isSingleUploading={isSingleUploading}
        isAddStartupModalOpen={isAddStartupModalOpen}
        setIsAddStartupModalOpen={setIsAddStartupModalOpen}
        onAddStartup={handleAddStartup}
      />
    </div>
  );
};

export default Scouting;
