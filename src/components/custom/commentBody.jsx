import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import RateButtons from "@/components/custom/rateButtons";

const CommentBody = ({
  id,
  posterId,
  postId,
  profile,
  nestedProfile,
  userName,
  nestedUserName,
  paragraph,
  nestedParagraph,
  likes,
  dislikes,
  isReply,
  isOwner,
  ownerId,
  onDeleteBtnClick,
  onLikeClick,
  onDislikeClick,
}) => {
  console.log("likes", likes);
  const rating = likes.includes(ownerId)
    ? "like"
    : dislikes.includes(ownerId)
    ? "dislike"
    : "";

  return (
    <Card className="mb-2">
      <CardHeader className="flex flex-row">
        <a href={`/user/${posterId}`} className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={profile} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userName}
        </a>
      </CardHeader>

      <CardContent>
        {isReply ? (
          <Card className="p-4">
            <CardHeader className="p-0 space-y-0 flex flex-row">
              <div className="flex items-center gap-4">
                Replying to
                <a className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={nestedProfile} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {nestedUserName}
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-2 text-zinc-400 text-ellipsis text-nowrap overflow-hidden">
              {nestedParagraph}
            </CardContent>
          </Card>
        ) : null}

        {/* Reply */}
        <div className="mt-2 grid w-full items-center">
          <div className="flex flex-col">{paragraph}</div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-4">
        <RateButtons
          likes={likes.length}
          dislikes={dislikes.length}
          horizontal
          userRating={rating}
          onLikeClick={onLikeClick}
          onDislikeClick={onDislikeClick}
        />
        <div>
          <Button
            variant="ghost"
            style={{ width: "100px" }}
            onClick={() => window.location.replace(`/reply/${postId}/${id}`)}
          >
            <Send style={{ width: "1.5rem", height: "1.5rem" }} />
            Reply
          </Button>
        </div>
        {isOwner ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger variant="ghost" className="ml-[15px]">
                <MoreVertical style={{ width: "1.5rem", height: "1.5rem" }} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => window.location.replace(`/editcomment/${id}`)}
                >
                  Edit comment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDeleteBtnClick}>
                  Delete comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default CommentBody;
