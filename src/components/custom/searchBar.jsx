import { Search } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FilterSearch } from "./filterSearch";

const SearchBar = () => {
  return (
    <div className="flex gap-4">
      <Input type="text" placeholder="Search Posts" />
      <Button onClick={() => window.location.replace('/searchpage')}>
        <Search />
      </Button>
      {/* TODO */}
      <FilterSearch tags={[]} />
    </div>
  );
};

export default SearchBar;
