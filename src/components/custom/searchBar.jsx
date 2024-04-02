import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FilterSearch } from './filterSearch';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState([]);

  const handleSearch = () => {
    const queryParams = {};
    if (searchQuery) {
      queryParams.q = encodeURIComponent(searchQuery);
    }
    if (tags.length > 0) {
      queryParams.t = tags.join(",");
    }
    const queryString = new URLSearchParams(queryParams).toString();
    window.location.replace(`/searchpage?${queryString}`);
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
      <FilterSearch onTagsChange={setTags} />
    </div>
  );
};

export default SearchBar;