import React from "react";
import { Badge } from "../ui/badge";

const ButtonTag = ({ clickFunction, children }) => {
  return (
    <div>
      <Badge className=" hover:bg-primary mb-1">
        #{children}
        <button
          onClick={clickFunction}
          className=" text-center rounded-full border-transparent m-0 ml-1 w-4 h-4 font-semi-bold text-sm flex items-center justify-center hover:bg-gray-300"
        >
          x
        </button>
      </Badge>
    </div>
  );
};

export default ButtonTag;
