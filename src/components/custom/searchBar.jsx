import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FilterSearch } from './filterSearch';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    window.location.replace(`/searchpage?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-4">
      <Input
        type="text"
        placeholder="Search Posts"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button onClick={handleSearch}>
        <Search />
      </Button>
      {/* TODO */}
      <FilterSearch tags={[]} />
    </div>
  );
};

export default SearchBar;
