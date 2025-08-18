
import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type NavigationContextType = {
  restoreLastVisitedPage: () => void;
  clearStoredRoute: () => void;
};

const NavigationContext = createContext<NavigationContextType>({
  restoreLastVisitedPage: () => {},
  clearStoredRoute: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

const LAST_VISITED_ROUTE_KEY = 'lastVisitedRoute';

// Routes that should not be stored or restored
const EXCLUDED_ROUTES = ['/auth'];

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Store current route in localStorage whenever location changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't store excluded routes
    if (!EXCLUDED_ROUTES.includes(currentPath)) {
      localStorage.setItem(LAST_VISITED_ROUTE_KEY, currentPath);
    }
  }, [location.pathname]);

  const restoreLastVisitedPage = () => {
    try {
      const lastRoute = localStorage.getItem(LAST_VISITED_ROUTE_KEY);
      
      if (lastRoute && !EXCLUDED_ROUTES.includes(lastRoute)) {
        // Validate that the route is one of our known routes - REMOVED "/" and fixed /startups to /scouting
        const validRoutes = ['/dashboard', '/due-diligence', '/inbox', '/scouting', '/vc-management'];
        const isValidRoute = validRoutes.includes(lastRoute) || 
                           lastRoute.startsWith('/startup/'); // Handle dynamic routes
        
        if (isValidRoute) {
          navigate(lastRoute, { replace: true });
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore last visited page:', error);
    }
    
    // Default fallback - always go to dashboard
    navigate('/dashboard', { replace: true });
  };

  const clearStoredRoute = () => {
    localStorage.removeItem(LAST_VISITED_ROUTE_KEY);
  };

  const value = {
    restoreLastVisitedPage,
    clearStoredRoute,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
