import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React from "react";

const Test = () => {
  return (
    <div className="flex flex-col gap-4">
      <Button asChild>
        <Link to="/landing">Go to Landing Page</Link>
      </Button>
      <Button asChild>
        <Link to="/login">Go to Login Page</Link>
      </Button>
      <Button asChild>
        <Link to="/search">Go to Search Page</Link>
      </Button>
      <Button asChild>
        <Link to="/signup">Go to Signup Page</Link>
      </Button>
      <Button asChild>
        <Link to="/user">Go to User Page</Link>
      </Button>
      <Button asChild>
        <Link to="/writepost">Go to Write Post Page</Link>
      </Button>
      <Button asChild>
        <Link to="/editpost">Go to Edit Post Page</Link>
      </Button>
      <Button asChild>
        <Link to="/comment">Go to Comment Page</Link>
      </Button>
      <Button asChild>
        <Link to="/post">Go to Post Page</Link>
      </Button>
    </div>
  );
};

export default Test;
