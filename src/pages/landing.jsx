import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimBackground from "@/components/custom/animBackground";
import CardList from "@/components/custom/cardList";
import Header from "@/components/custom/header";
import PostCard from "@/components/custom/postCard";
import PostCardSkeleton from '@/components/custom/postCardSkeleton';
import { Account } from '@/lib/Account';

const Landing = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const [enableWritePost, setEnableWritePost] = useState(false);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/posts/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch recent posts');
      }
      const data = await response.json();
      
      const formattedRecentPosts = await Promise.all(data.map(async (post) => {
        const userResponse = await fetch(`/api/users/${post.posterId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user information');
        }
        const userData = await userResponse.json();
        const username = userData.user.username;
        
        const account = await Account.getDetails();

        return {
          ...post,
          likes: post.reactions.likerIds.length, 
          dislikes: post.reactions.dislikerIds.length,
          ...(account ? 
            ({ userRating: post.reactions.likerIds.includes(account._id) ? 'like' : post.reactions.dislikerIds.includes(account._id) ? 'dislike' : '' })
            : ({})),
          author: username 
        };
      }));
      
      setRecentPosts(formattedRecentPosts);
      setLoadingRecent(false);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      setLoadingRecent(false);
    }
  }; 

  const fetchPopularPosts = async () => {
    try {
      const response = await fetch('/api/posts/popular');
      if (!response.ok) {
        throw new Error('Failed to fetch popular posts');
      }
      const data = await response.json();
      
      const formattedPopularPosts = await Promise.all(data.map(async (post) => {
        const userResponse = await fetch(`/api/users/${post.posterId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user information');
        }
        const userData = await userResponse.json();
        const username = userData.user.username;
        
        const account = await Account.getDetails();

        return {
          ...post,
          likes: post.reactions.likerIds.length, 
          dislikes: post.reactions.dislikerIds.length,
          ...(account ? 
            ({ userRating: post.reactions.likerIds.includes(account._id) ? 'like' : post.reactions.dislikerIds.includes(account._id) ? 'dislike' : '' })
            : ({})),
          author: username 
        };
      }));
      
      setPopularPosts(formattedPopularPosts);
      setLoadingPopular(false);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      setLoadingPopular(false);
    }
  };

  const fetchLoginStatus = async () => {
    setEnableWritePost(await Account.isLoggedIn());
  };

  useEffect(() => {
    fetchRecentPosts();
    fetchPopularPosts();

    fetchLoginStatus();
  }, []);

  return (
    <AnimBackground>
      <div className="w-full h-full bg-background">
        <Header />
        <main>
          <Tabs defaultValue="recent" className="px-16 py-5 mt-2">
            <div className="mb-4 flex justify-between">
              <div className="flex items-center gap-3">
                <TabsList>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>
                <h2 className="text-3xl font-bold">Posts</h2>
              </div>
              <Button asChild={enableWritePost} disabled={!enableWritePost}>
                <a href="/writePost">Create a Post</a>
              </Button>
            </div>
            <TabsContent value="recent">
              <CardList displayCount={6}>
                {loadingRecent ? (
                  recentPosts.map(post => (
                    <PostCardSkeleton key={post._id} />
                  ))
                ) : (
                  recentPosts.map(post => (
                    <PostCard
                      key={post._id}
                      id={post._id}
                      title={post.title}
                      author={post.author}
                      body={post.body}
                      uploadDate={post.uploadDate}
                      likes={post.likes}
                      dislikes={post.dislikes}
                      userRating={post.userRating}
                      tags={post.tags}
                      disableReactions={true}
                    />
                  ))
                )}
              </CardList>
            </TabsContent>
            <TabsContent value="popular">
              <CardList displayCount={6}>
                {loadingPopular ? (
                  popularPosts.map(post => (
                    <PostCardSkeleton key={post._id} />
                  ))
                ) : (
                  popularPosts.map(post => (
                    <PostCard
                      key={post._id}
                      id={post._id}
                      title={post.title}
                      author={post.author}
                      body={post.body}
                      uploadDate={post.uploadDate}
                      likes={post.likes}
                      dislikes={post.dislikes}
                      userRating={post.userRating}
                      tags={post.tags}
                      disableReactions={true}
                    />
                  ))
                )}
              </CardList>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AnimBackground>
  );
};

export default Landing;