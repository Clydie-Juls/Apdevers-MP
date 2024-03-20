import { useEffect, useState } from "react";

import ButtonTag from "./buttonTag";
import { Input } from "../ui/input";

const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput("");
  }, [tags]);

  function addTag(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (input.length > 0) {
        const newTags = [...tags, input];
        onChange(newTags);
      }
    }
  }

  function removeTag(e, i) {
    e.preventDefault();

    const newTags = tags.filter((tag, index) => i !== index);
    onChange(newTags);
  }

  return (
    <div>
      <div className=" flex gap-2 flex-wrap mb-2">
        {tags.map((tag, i) => (
          <ButtonTag
            clickFunction={(e) => removeTag(e, i)}
            key={`Tag-button-${i}`}
          >
            {tag}
          </ButtonTag>
        ))}
      </div>
      <Input
        className="bg-black"
        id="tags"
        placeholder="Enter tag"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
      />
    </div>
  );
};

export default TagInput;
