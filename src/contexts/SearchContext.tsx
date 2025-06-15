import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchTerm: string;
  isSearching: boolean;
  setSearchTerm: (term: string) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] fix tests= useState(false);

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const value = {
    searchTerm,
    isSearching,
    setSearchTerm,
    setIsSearching,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}; 