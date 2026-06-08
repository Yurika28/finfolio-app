'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface SearchContextValue {
  query: string
  setQuery: (q: string) => void
}

const SearchContext = createContext<SearchContextValue>({
  query: '',
  setQuery: () => {},
})

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState('')
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)