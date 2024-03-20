import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

// TODO: Like and dislike props
const RateButtons = ({
    likes,
    dislikes,
    horizontal,
    userRating,
    disableReactions,
    onLikeClick,
    onDislikeClick
}) => {
  //LOL AKALA KO GET method POST pala. Will fix if may time

  //   useEffect(() => {
  //     const fetchLikes = async () => {
  //       const response = await fetch(`/api/comments/like/${commentId}`);
  //       if (!response.ok) {
  //         const errorMessage = await response.text();
  //         throw new Error(errorMessage || "Fetch likes failed");
  //       }

  //       const likes = await response.json();
  //       setLikes()
  //     };

  //     const fetchDislikes = async () => {
  //         const response = await fetch(`/api/comments/dislike/${commentId}`);
  //         if (!response.ok) {
  //           const errorMessage = await response.text();
  //           throw new Error(errorMessage || "Fetch dislikes failed");
  //         }

  //         const dislikes = await response.json();
  //       };
  //   }, []);
    return (
        <div className={'flex justify-center items-end ' + (horizontal ? 'gap-1 flex-row' : 'gap-5 flex-col')}>
            {disableReactions ? 
                <>
                    <div className='p-3 flex gap-3 items-center text-zinc-400'>
                        {likes}
                        
                        <ThumbsUp 
                            fill={userRating === 'like' ? '#fff' : ''}
                            stroke="#fff"
                        />
                    </div>
                    <div className='p-3 flex gap-3 items-center text-zinc-400'>
                        {dislikes}

                        <ThumbsDown 
                            fill={userRating === 'dislike' ? '#fff' : ''} 
                            stroke="#fff"
                        />
                    </div>
                </>

            :
                <>
                    <Button 
                        className='flex gap-3 items-center border-none text-zinc-400' 
                        variant="ghost"
                        onClick={onLikeClick}
                    >
                        {likes}
                        
                        <ThumbsUp 
                            fill={userRating === 'like' ? '#fff' : ''}
                            stroke="#fff"
                        />
                    </Button>

                    <Button 
                        className='flex gap-3 items-center border-none text-zinc-400' 
                        variant="ghost"
                        onClick={onDislikeClick}
                    >
                        {dislikes}

                        <ThumbsDown 
                            fill={userRating === 'dislike' ? '#fff' : ''} 
                            stroke="#fff"
                        />
                    </Button>
                </>
            }
        </div>
    );
};

export default RateButtons;
