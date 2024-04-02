import React, { useEffect, useState } from 'react';
import Header from '@/components/custom/header';
import AnimBackground from '@/components/custom/animBackground';
import PostCard from '@/components/custom/postCard';
import SearchHeader from '@/components/custom/searchHeader';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const SearchPage = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const searchQuery = urlParams.get('q') || '';
        const tags = urlParams.get('t') ? urlParams.get('t').split(',') : [];
        
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}&t=${tags.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleSortChange = (value) => {
    setSortBy(value);
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

  return (
    <AnimBackground>
      <div className="w-full h-full bg-background">
        <Header />
        <SearchHeader datePosted={'Oldest'} views={'Lowest'} searchResultsCount={posts.length} />
          
        <div className="flex flex-col gap-2 px-16 py-5">
          {sortPosts(posts).map(p => (
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
          ))}
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
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </AnimBackground>
  );
};

export default SearchPage;