import RateButtons from './rateButtons';
import Tag from './tag';

// TODO: Make the props the same as the DB schema
const CommentCard = ({ 
    post,
    body,
    uploadDate,
    reactions,
    userRating,
    disableReactions
}) => {
    return (
        <div 
            className='px-7 py-5 overflow-hidden grid grid-cols-[1fr_auto] border-2 border-border rounded-xl bg-zinc-950 hover:bg-zinc-900'
        >
            <a 
                className='overflow-hidden flex flex-col gap-2 justify-center'
                href={`/post/${post._id}`}
            >
                <h3 className='text-xl font-bold'>In &quot;{post.title}&quot;</h3>

                <div className='flex gap-2'>
                    {post.tags.map((name, i) => <Tag key={i} name={name} />)}
                </div>

                <p className='overflow-hidden text-ellipsis text-nowrap text-zinc-400'>{body}</p>

                <p className='text-sm'>Uploaded {new Date(uploadDate).toISOString().slice(0,10)}</p>
            </a>

            <RateButtons 
                disableReactions={disableReactions}
                likes={reactions.likerIds.length} 
                dislikes={reactions.dislikerIds.length} 
                userRating={userRating} 
            />
        </div>
    );
};

export default CommentCard;