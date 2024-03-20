import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const PostHeader = ({posterId, title, profile, userName}) => {
  console.log(profile);

  return (
    <div className="my-4 max-w-[100vw] flex flex-col gap-3">
    <div className='mb-4 flex items-end gap-6'>
      <h2 className="text-4xl font-bold">{title}</h2>
      <p className='flex items-center gap-4'>
        By 
        <a href={`/user/${posterId}`} className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage src={profile} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          {userName}
        </a>
      </p>
    </div>
    </div>
  )
}

export default PostHeader