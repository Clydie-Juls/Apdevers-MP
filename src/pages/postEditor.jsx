import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TagInput from "@/components/custom/tagInput";
import { useParams } from "react-router";
import { useEffect, useRef, useState } from 'react';

const PostEditor = ({ isWritePost }) => {
  const { id } = useParams();
  const formRef = useRef();

  const [postInfo, setPostInfo] = useState({
    title: '',
    body: '',
    tags: ["Technology", "Programming"]
  });

  useEffect(() => {
    if (!isWritePost && !id) {
      location.replace('/');
      return;
    }

    const fetchData = async () => {
      const response = await fetch(`/api/posts/${id}`);

      if (response.status === 404) {
        setPostInfo(null);
        return;
      }

      const { post } = await response.json();
      setPostInfo({
        title: post.title,
        body: post.body,
        tags: post.tags
      });
    };

    if (!isWritePost) {
      fetchData();
    }
  }, [id, isWritePost]);

  function handleTagsChange(newTags) {
    setPostInfo(pi => ({
      ...pi,
      tags: newTags
    }))
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const formElem = formRef.current;
    
    const formBody = new FormData(formElem);
    postInfo.tags.forEach(t => formBody.append('tags[]', t));
    
    const postUrl = (!id) ? 
      await fetch('/api/posts/write', {
        method: 'post',
        body: formBody
      })
    :
      await fetch(`/api/posts/edit/${id}`, {
        method: 'put',
        body: formBody
      });
    
    location.replace(await postUrl.text());
  }

  return (
    <div className="w-screen h-screen px-6 py-10 flex flex-col gap-6 items-center overflow-x-hidden">
      <img
        className=" w-full h-full object-cover fixed -z-10 brightness-[0.15]"
        src="/images/star-bg.png"
        alt="cube background image"
      />
      <div className="flex flex-col gap-4 w-full sticky top-0 bg-black">
        <h1 className=" text-4xl font-bold">
          {isWritePost ? "Write A Post" : "Edit your Post"}
        </h1>
        <p className="text-muted-foreground">
          Share your tech-tacular post that peaks the community`s interest
        </p>
        <Separator />
      </div>
      <form ref={formRef} className="w-full">
        <div className="flex flex-col gap-8 items-center px-[20%] w-full ">
          <div className="flex flex-col gap-3 w-full">
            <Label htmlFor="title">Title</Label>
            {isWritePost ? (
              <Input
                className="bg-black"
                id="title"
                name="title"
                placeholder="Bro Richie Finally Created GPT 5.0"
              />
            ) : (
              <Input 
                className="bg-black" 
                id="title" 
                name="title" 
                value={postInfo.title}
                onInput={(e) => setPostInfo(pi => ({ ...pi, title: e.target.value }))}
              />
            )}

            <p className="text-sm text-muted-foreground">
              Write an eye-catching title that turns eyeballs into clickbait
              magnets.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Label htmlFor="tags">Tags</Label>
            <TagInput tags={postInfo.tags} onChange={handleTagsChange} />
            <p className="text-sm text-muted-foreground">
              Add some tags to let people know what your post is about.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Label htmlFor="description">Description</Label>
            {isWritePost ? (
              <Textarea
                className="bg-black"
                placeholder="Type your message here."
                id="description"
                name="body"
              />
            ) : (
              <Textarea
                className="bg-black"
                id="description"
                name="body"
                value={postInfo.body}
                onInput={(e) => setPostInfo(pi => ({ ...pi, body: e.target.value }))}
              />
            )}

            <p className="text-sm text-muted-foreground">
              Introduce your thoughts by writing your description about the
              topic.
            </p>
          </div>

          <Button className="px-9" onClick={handleFormSubmit}>Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
