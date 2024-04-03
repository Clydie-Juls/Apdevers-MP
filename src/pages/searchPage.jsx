import React, { useEffect, useState } from 'react';
import Header from '@/components/custom/header';
import AnimBackground from '@/components/custom/animBackground';
import PostCard from '@/components/custom/postCard';
import SearchHeader from '@/components/custom/searchHeader';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const SearchPage = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const searchQuery = urlParams.get('q') || '';
        const tags = urlParams.get('t') ? urlParams.get('t').split(',') : [];
        setTags(tags); 
        
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}&t=${tags.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();

        const postsWithAuthors = await Promise.all(data.map(async post => {
          const authorResponse = await fetch(`/api/users/${post.posterId}`);
          if (!authorResponse.ok) {
            throw new Error('Failed to fetch author information');
          }
          const authorData = await authorResponse.json();
          return {
            ...post,
            author: authorData.user.username,
            likes: post.reactions.likerIds.length, 
            dislikes: post.reactions.dislikerIds.length 
          };
        }));

        setPosts(postsWithAuthors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
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
        <SearchHeader datePosted={'Oldest'} views={'Lowest'} searchResultsCount={posts.length} tags={tags} />
          
        <div className="flex flex-col gap-2 px-16 py-5">
          {loading ? (
            <div>Loading...</div>
          ) : (
            sortPosts(posts).map(p => (
              <PostCard
                key={p.id} 
                id={p.id} 
                title={p.title}
                author={p.author} 
                body={p.body}
                uploadDate={p.uploadDate}
                views={p.views}
                likes={p.likes}
                dislikes={p.dislikes}
                userRating={p.userRating}
                tags={p.tags}
              />
            ))
          )}
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