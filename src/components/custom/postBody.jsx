import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Tag from "@/components/custom/tag";
import { MessageCircle, Send, MoreVertical } from "lucide-react";
import RateButtons from "@/components/custom/rateButtons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Account } from '@/lib/Account';

const PostBody = ({
  id,
  accountId,
  numComments,
  tags,
  paragraph,
  onDeleteButtonClick,
  likerIds,
  dislikerIds,
  onLikeClick,
  onDislikeClick,
}) => {
  const rating = likerIds.includes(accountId)
    ? "like"
    : dislikerIds.includes(accountId)
    ? "dislike"
    : "";


  const [enableWriteComment, setEnableWriteComment] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const isLoggedIn = await Account.isLoggedIn();
        setEnableWriteComment(isLoggedIn);
      } catch (error) {
        console.error('Error fetching login status:', error);
      }
    };

    fetchLoginStatus();
  }, []);

  const handleAddCommentClick = () => {
    if (enableWriteComment) {
      navigate(`/writecomment/${id}`);
    } else {
      navigate('/login', { state: { message: 'User must be logged in to use this feature' } });
    }
  };

  return (
    <Card className="mb-14">
      <CardHeader className="space-y-0 flex flex-row gap-6">
        <div className="flex gap-2">
          {tags && tags.map((tag, i) => <Tag key={`${tag}-${i}`} name={tag} />)}
        </div>

        <div className="flex gap-2">
          <MessageCircle style={{ width: "1.5rem", height: "1.5rem" }} />
          <span>{numComments}</span>
        </div>
      </CardHeader>

      <CardContent>
        <form>
          <div className="grid w-full items-center">
            <div className="flex flex-col">{paragraph}</div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-start gap-5">
        <RateButtons
          likes={likerIds.length}
          dislikes={dislikerIds.length}
          horizontal
          userRating={rating}
          onLikeClick={onLikeClick}
          onDislikeClick={onDislikeClick}
        />
        <div>
          <Button
            variant="ghost"
            style={{ width: "180px" }}
            onClick={handleAddCommentClick}
          >
            <Send style={{ width: "1.5rem", height: "1.5rem" }} />
            Add a comment
          </Button>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger variant="ghost">
              <MoreVertical style={{ width: "1.5rem", height: "1.5rem" }} />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => window.location.replace(`/editpost/${id}`)}
              >
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteButtonClick}>
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostBody;