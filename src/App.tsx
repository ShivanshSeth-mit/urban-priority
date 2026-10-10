import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PriorityMapView } from './components/PriorityMapView';
import { RegisterIssueModal } from './components/RegisterIssueModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { LimitationsBanner } from './components/LimitationsBanner';
import { INITIAL_ISSUES } from './data/sampleIssues';
import { IssueItem, IssueStatus } from './types/issue';
import { calculatePriorityScore } from './utils/priorityEngine';

export default function App() {
  const [issues, setIssues] = useState<IssueItem[]>(INITIAL_ISSUES);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map'>('dashboard');
  const [mapFocusedIssueId, setMapFocusedIssueId] = useState<string | null>(null);
  const [modalIssue, setModalIssue] = useState<IssueItem | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLimitationsOpen, setIsLimitationsOpen] = useState(false);

  // Handle adding a new issue from the register flow
  const handleIssueAdded = (newIssue: IssueItem) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  // Switch DIRECTLY to priority map, focus that pin, and close any modal
  const handleViewOnMap = (issue: IssueItem) => {
    setModalIssue(null);
    setMapFocusedIssueId(issue.id);
    setCurrentTab('map');
  };

  // Update an issue with new AI estimation or details
  const handleUpdateIssue = (updatedIssue: IssueItem) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item))
    );
    setModalIssue(updatedIssue);
  };

  // Status updates (e.g. dispatched, resolved)
  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issueId
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );
    if (modalIssue && modalIssue.id === issueId) {
      setModalIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Citizen upvote handler (people who issued the same problem)
  const handleVote = (issueId: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          const updatedVotes = item.votes + 1;
          const updatedFactors = {
            ...item.factors,
            citizenReportCount: item.factors.citizenReportCount + 1
          };
          const updatedPriority = calculatePriorityScore(item.category, updatedFactors);
          return {
            ...item,
            votes: updatedVotes,
            factors: updatedFactors,
            priority: updatedPriority
          };
        }
        return item;
      })
    );

    if (modalIssue && modalIssue.id === issueId) {
      setModalIssue((prev) => {
        if (!prev) return null;
        const updatedVotes = prev.votes + 1;
        const updatedFactors = {
          ...prev.factors,
          citizenReportCount: prev.factors.citizenReportCount + 1
        };
        const updatedPriority = calculatePriorityScore(prev.category, updatedFactors);
        return {
          ...prev,
          votes: updatedVotes,
          factors: updatedFactors,
          priority: updatedPriority
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Municipal Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLimitations={() => setIsLimitationsOpen(true)}
        issues={issues}
      />

      {/* Main Content Area Based on Tab (Dashboard & Priority Map) */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            issues={issues}
            onSelectIssue={(issue) => setModalIssue(issue)}
            onViewOnMap={handleViewOnMap}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onVote={handleVote}
          />
        )}

        {currentTab === 'map' && (
          <PriorityMapView
            issues={issues}
            selectedIssueId={mapFocusedIssueId}
            onSelectIssue={(issue) => setModalIssue(issue)}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onVote={handleVote}
          />
        )}
      </main>

      {/* Register New Issue Flow Modal */}
      <RegisterIssueModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onIssueAdded={handleIssueAdded}
        onViewOnMap={handleViewOnMap}
      />

      {/* Issue Detail Inspector Modal */}
      <IssueDetailModal
        issue={modalIssue}
        onClose={() => setModalIssue(null)}
        onViewOnMap={handleViewOnMap}
        onUpdateStatus={handleUpdateStatus}
        onVote={handleVote}
        onUpdateIssue={handleUpdateIssue}
      />

      {/* Prototype Scope & Limitations Explainer */}
      <LimitationsBanner
        isOpen={isLimitationsOpen}
        onClose={() => setIsLimitationsOpen(false)}
      />

    </div>
  );
}
