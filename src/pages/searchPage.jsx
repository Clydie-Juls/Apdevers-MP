import React, { useEffect, useState } from 'react';
import Header from '@/components/custom/header';
import AnimBackground from '@/components/custom/animBackground';
import PostCard from '@/components/custom/postCard';
import SearchHeader from '@/components/custom/searchHeader';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const SearchPage = () => {
  const [sortBy, setSortBy] = useState("recent");

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const filterPosts = (posts, tags) => {
    console.log("Tags:", tags); 
    
    const filteredPosts = posts.filter(post => {
      return tags.some(tag => post.tags.includes(tag));
    });
    
    console.log("Filtered Posts:", filteredPosts);
    
    return filteredPosts;
  };
  

  const sortPosts = (posts) => {
    switch (sortBy) {
      case "recent":
        return posts.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      case "popular":
        return posts.sort((a, b) => b.views - a.views);
      default:
        return posts;
    }
  };

  useEffect(() => {
    alert('Sorry, to be implemented!');
  }, []);

  return (
    <AnimBackground>
      <div className="w-full h-full bg-background">
        <Header />
          <SearchHeader datePosted={'Oldest'} views={'Lowest'} searchResultsCount={'2'} tag1={'Internet'} tag2={'Delivery'} tag3={'Amazon'} />
          
        <div className="flex flex-col gap-2 px-16 py-5">
        {sortPosts(filterPosts([], ["Internet", "Delivery", "Amazon"])).map(p => {
                  console.log("Post:", p); 
                  return (
                    <PostCard
                      id={p.id} 
                      key={p.id}
                      title={p.title}
                      author={'temp'}
                      body={p.body}
                      uploadDate={p.uploadDate}
                      views={p.views}
                      likes={p.likerIds.length}
                      dislikes={p.dislikerIds.length}
                      userRating={p.likerIds.includes(0) ? 'like' : 'dislike'}
                      tags={p.tags}
                    />
                  );
                })}
        </div>
        {/* Pagination */}
        <Pagination className="mt-4">
            <PaginationContent>
            <PaginationItem>
                <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
                {/* Make shown posts link based (item no. as param). */}
                <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
                <PaginationNext href="#" />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
      </div>
    </AnimBackground>
  );
};

export default SearchPage;