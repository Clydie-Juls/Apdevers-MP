import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TagInput from './tagInput';

export function FilterSearch({ onTagsChange }) {
  const [tags, setTags] = useState([]);

  const handleTagsChange = (newTags) => {
    setTags(newTags);
    onTagsChange(newTags);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filter</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] mt-2">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter Search</h4>
            <p className="text-sm text-muted-foreground">
              Quickly filter searches for specific posts.
            </p>
          </div>
          <div className="flex flex-col gap-4 mt-6">
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={handleTagsChange} />
            <div className="flex flex-wrap gap-2"></div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FilterSearch;