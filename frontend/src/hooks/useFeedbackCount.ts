import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { FeedbackService } from '@/services/feedbackService';

export const useFeedbackCount = () => {
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { company, userRole } = useCompany();

  useEffect(() => {
    const loadFeedbackCount = async () => {
      if (!company?.id || userRole !== 'admin') {
        setUnresolvedCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const feedback = await FeedbackService.getFeedback(company.id);
        const unresolved = feedback.filter(item => 
          item.status !== 'resolved' && item.status !== 'closed'
        ).length;
        setUnresolvedCount(unresolved);
      } catch (error) {
        console.error('Error loading feedback count:', error);
        setUnresolvedCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackCount();
  }, [company?.id, userRole]);

  return { unresolvedCount, loading };
};