import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';

const ProfileSide = ({
  name,
  description,
  picture,
  showUserButtons,
  onDeleteButtonClick,
  onDescriptionInput,
  onDescriptionSet,
  onInfoEditButtonClick,
  onPictureUpload
}) => {
  const descElemRef = useRef();

  const [descEditable, setDescEditable] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'file';
    input.click();

    input.addEventListener('change', () => {
      const formData = new FormData();
      formData.append('file', input.files[0]);
      
      onPictureUpload(formData);
    });
};

  const handleDelete = () => {
    onDeleteButtonClick();
    setShowDeleteModal(false);
  };

  const handleEditDesc = () => {
    setDescEditable(true);

    setTimeout(() => {
      descElemRef.current.focus();
    }, 0);
  };

  const handleDescElemBlur = (e) => {
    if (descEditable) {
      onDescriptionSet(e.target.value);
      setDescEditable(false);
    }
  };

  const handleDescElemInput = (e) => {
    onDescriptionInput(e.target.value);
  };

  return (
    <div 
      className='w-[35ch] min-h-100 p-5 flex flex-col items-stretch gap-8 border-2 border-border rounded-xl bg-zinc-950'
    >
      <div className='flex flex-col gap-2 items-center'>
        <Avatar 
          className={'relative min-h-40 min-w-40 ' + (showUserButtons && ' cursor-pointer')}
          onClick={showUserButtons ? handleAvatarClick : undefined}
        >
            <AvatarImage src={picture} />
            <AvatarFallback>{name && name[0]}</AvatarFallback>

            {showUserButtons && 
              <button 
                className='absolute inset-0 flex justify-center items-center opacity-0 hover:bg-zinc-700 hover:opacity-80'
              >
                <Pencil size={30} />
              </button>
            }
        </Avatar>

        <p className="text-2xl font-bold">{name}</p>
      </div>

      <textarea 
        ref={descElemRef} 
        type="text"
        className={'resize-none max-w-[40ch] bg-transparent' + (!descEditable ? ' focus:outline-none' : '')} 
        readOnly={!descEditable}
        value={description} 
        onBlur={handleDescElemBlur}
        onInput={handleDescElemInput}
      />

      <div className='mt-1 flex flex-col justify-center gap-3'>
        {showUserButtons && 
          <>
            <Button onClick={handleEditDesc}>Edit Description</Button>
            <Button onClick={onInfoEditButtonClick}>Edit Login Info</Button>

            <Button variant="destructive" onClick={setShowDeleteModal}>Delete Profile</Button>
          </>
        }
      </div>

      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center">
          <div className="bg-black text-white border border-white p-8 rounded-lg">
            <p className="text-lg font-bold mb-4">Confirm Deletion</p>
            <p className="mb-4">Are you sure you want to delete your profile?</p>
            <div className="flex justify-between">
              <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button onClick={handleDelete} variant="destructive">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSide;
