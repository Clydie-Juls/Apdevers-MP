import React from 'react';
import RateButtons from './rateButtons';
import Tag from './tag';

const PostCard = ({ 
    id,
    title, 
    author,
    body,
    uploadDate,
    likes,
    dislikes,
    userRating,
    tags,
    disableReactions,
    onLikeClick,
    onDislikeClick
}) => {
    return (    
        <div className='px-7 py-5 overflow-hidden grid grid-cols-[1fr_auto] items-center border-2 border-border rounded-xl bg-zinc-950 hover:bg-zinc-900'>
            <a className='overflow-hidden flex flex-col gap-2' href={`/post/${id}`}>
                <h3 className='text-xl font-bold'>{title}</h3>

                <div className='flex gap-2'>
                    {tags.map((name, i) => <Tag key={i} name={name} />)}
                </div>

                <p className='overflow-hidden text-ellipsis text-nowrap text-zinc-400'>{body}</p>

                <div className='flex gap-2'>
                    <p className='text-sm'>By {author}</p>
                    <p className='text-sm'>Uploaded {new Date(uploadDate).toISOString().slice(0,10)}</p>
                </div>
            </a>

            <RateButtons 
                likes={likes} 
                dislikes={dislikes} 
                userRating={userRating} 
                disableReactions={disableReactions}
                onLikeClick={onLikeClick}
                onDislikeClick={onDislikeClick}
            />
        </div>
    );
};

export default PostCard;