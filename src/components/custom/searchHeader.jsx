import React from 'react';
import Tag from '@/components/custom/tag';

const SearchHeader = ({ searchResultsCount, tags }) => {
  return (
    <header className="px-16 py-4">
      <h1 className="text-2xl font-bold mb-4">{searchResultsCount} result/s found</h1>
      {tags && tags.length > 0 ? (
        <div className='flex gap-2' style={{ paddingTop: '1rem' }}>
          <h1 className="text-2xl font-bold">Tags used:</h1>
          {tags.map((tag, index) => (
            <Tag key={index} name={tag} />
          ))}
        </div>
      ) : (
        <p className="text-2xl font-bold">No tags used</p>
      )}
    </header>
  );
};

export default SearchHeader;
