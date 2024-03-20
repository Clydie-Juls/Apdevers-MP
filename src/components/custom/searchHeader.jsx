import React from 'react'
import Tag from '@/components/custom/tag';
import { Button } from '../ui/button';

const SearchHeader = ({datePosted, views, searchResultsCount, tag1, tag2, tag3}) => {
  return (
    <header className="px-16 py-4">
        <h1 className="text-2xl font-bold mb-4">{searchResultsCount} result/s found</h1>
        <div className='flex gap-2' style={{ paddingTop: '1rem' }}>
              <h1 className="text-2xl font-bold">Tags used:</h1>
              <Tag name={tag1}/>
              <Tag name={tag2}/>
              <Tag name={tag3}/>
        </div>
        <div className='flex gap-2 items-center' style={{ paddingTop: '1rem' }}>
              <h1 className="text-2xl font-bold">Sorted by:</h1>
              <Button variant="ghost">Date Posted: {datePosted}</Button>
              <Button variant="ghost">Views: {views}</Button>
        </div>
    </header>
  )
}

export default SearchHeader