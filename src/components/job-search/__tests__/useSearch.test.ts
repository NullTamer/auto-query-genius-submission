
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch';
import { SearchProvider, JobBoardSelection } from '../types';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/search', search: '?q=test&provider=google' }),
  useNavigate: () => jest.fn()
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(() => Promise.resolve({
        data: {
          success: true,
          results: [{ title: 'Candidate 1', company: 'Company 1' }]
        }
      }))
    },
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } }))
    },
    from: jest.fn(() => ({
      insert: jest.fn()
    }))
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('useSearch hook', () => {
  // Create a complete selectedBoards object that matches the updated JobBoardSelection type
  const fullSelectedBoards: JobBoardSelection = {
    google: true,
    linkedin: false,
    indeed: false,
    github: false,
    stackoverflow: false,
    twitter: false,
    wellfound: false
  };

  const defaultProps = {
    initialQuery: 'test query',
    searchProvider: 'google' as SearchProvider,
    selectedBoards: fullSelectedBoards
  };

  it('should initialize with correct values', () => {
    const { result } = renderHook(() => useSearch(defaultProps));
    
    expect(result.current.searchTerm).toBe('test query');
    expect(result.current.selectedTerms).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('should update searchTerm when setSearchTerm is called', () => {
    const { result } = renderHook(() => useSearch(defaultProps));
    
    act(() => {
      result.current.setSearchTerm('new query');
    });
    
    expect(result.current.searchTerm).toBe('new query');
  });

  it('should toggle selected terms correctly', () => {
    const { result } = renderHook(() => useSearch(defaultProps));
    
    // Add a term
    act(() => {
      result.current.handleTermToggle('javascript');
    });
    expect(result.current.selectedTerms).toEqual(['javascript']);
    
    // Add another term
    act(() => {
      result.current.handleTermToggle('react');
    });
    expect(result.current.selectedTerms).toEqual(['javascript', 'react']);
    
    // Remove a term
    act(() => {
      result.current.handleTermToggle('javascript');
    });
    expect(result.current.selectedTerms).toEqual(['react']);
  });

  it('should clear search correctly', () => {
    const { result } = renderHook(() => useSearch(defaultProps));
    
    // Set up some values
    act(() => {
      result.current.setSearchTerm('test query');
      result.current.handleTermToggle('javascript');
    });
    
    // Clear the search
    act(() => {
      result.current.clearSearch();
    });
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedTerms).toEqual([]);
  });
});
