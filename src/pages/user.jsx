import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AnimBackground from "@/components/custom/animBackground";
import CardList from "@/components/custom/cardList";
import Header from "@/components/custom/header";
import PostCard from "@/components/custom/postCard";
import CommentCard from "@/components/custom/commentCard";
import ProfileSide from "@/components/custom/profileSide";
import { Account } from "@/lib/Account";

const User = () => {
  const { id } = useParams();

  const [userInfo, setUserInfo] = useState({
    user: {
      name: "",
      description: "",
      picture: null,
    },
    posts: [],
    comments: [],
  });

  const [showUserButtons, setShowUserButtons] = useState(false);

  useEffect(() => {
    if (!id) {
      location.replace("/");
      return;
    }

    const fetchData = async () => {
      const response = await fetch(`/api/users/${id}`);

      if (response.status === 404) {
        setUserInfo(null);
        return;
      }

      const info = await response.json();
      setUserInfo({
        ...info,
        posts: await Promise.all(info.posts.map(async p => {
          const author = (await (await fetch(`/api/users/${p.posterId}`)).json()).user.username;
          return { ...p, author }
        }))
      });
    };

    const checkLogin = async () => {
      if (!(await Account.isLoggedIn())) {
        return;
      }

      const { _id } = await Account.getDetails();
      setShowUserButtons(_id === id);
    };

    fetchData();
    checkLogin();
  }, [id]);

  async function handleDeleteButtonClick() {
    await fetch(`/api/users/${id}`, {
      method: "delete",
    });

    location.replace("/");
  }

  function handleDescriptionInput(newDescription) {
    setUserInfo((ui) => ({
      ...ui,
      user: {
        ...ui.user,
        description: newDescription,
      },
    }));
  }

  async function handleDescriptionSet(newDescription) {
    await fetch(`/api/users/edit/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: newDescription,
      }),
    });
  }

  function handleInfoEditButtonClick() {
    location.replace(`/editlogininfo/${id}`);
  }

  async function handlePictureUpload(formData) {
    const response = await fetch(`/api/users/picture/${id}`, {
      method: "post",
      body: formData,
    });

    const pictureLink = await response.text();

    setUserInfo((ui) => ({
      ...ui,
      user: {
        ...ui.user,
        picture: pictureLink,
      },
    }));
  }

  return (
    <AnimBackground>
      <div className="w-full h-full grid grid-rows-[auto_1fr] min-h-screen">
        <Header />

        {userInfo === null ? (
          <main className="px-16 py-5 flex justify-center items-center">
            <p className="text-3xl">The user does not exist.</p>
          </main>
        ) : (
          <main className="px-16 py-5 grid grid-cols-[auto_1fr] gap-5">
            <ProfileSide
              name={userInfo.user.username}
              description={userInfo.user.description}
              picture={userInfo.user.picture}
              showUserButtons={showUserButtons}
              onDeleteButtonClick={handleDeleteButtonClick}
              onDescriptionInput={handleDescriptionInput}
              onDescriptionSet={handleDescriptionSet}
              onInfoEditButtonClick={handleInfoEditButtonClick}
              onPictureUpload={handlePictureUpload}
            />

            <Tabs defaultValue="posts">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-3">
                <CardList displayCount={4}>
                  {userInfo.posts.map((p) => (
                    <PostCard 
                      key={p._id} 
                      id={p._id} 
                      title={p.title} 
                      author={p.author}
                      body={p.body}
                      uploadDate={p.uploadDate}
                      likes={p.reactions.likerIds.length}
                      dislikes={p.reactions.dislikerIds.length}
                      userRating={(showUserButtons && p.reactions.likerIds.includes(id)) ? 'like' : (showUserButtons && p.reactions.dislikerIds.includes(id)) ? 'dislike' : ''}
                      tags={p.tags}
                      disableReactions={true}
                    />
                  ))}
                </CardList>
              </TabsContent>

              <TabsContent value="comments">
                <CardList displayCount={4}>
                  {userInfo.comments.map((c) => (
                    <CommentCard 
                      key={c._id} 
                      {...c} 
                      userRating={(showUserButtons && c.reactions.likerIds.includes(id)) ? 'like' : (showUserButtons && c.reactions.dislikerIds.includes(id)) ? 'dislike' : ''}
                      disableReactions={true} 
                    />
                  ))}
                </CardList>
              </TabsContent>
            </Tabs>
          </main>
        )}
      </div>
    </AnimBackground>
  );
};

export default User;
