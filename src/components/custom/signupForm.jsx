import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignupForm = () => {
  function handleConfirmPasswordChange(e) {
    // TODO: Lol
    const passwordInput = document.querySelector("#password");
    const confirmInput = e.target;

    if (passwordInput.value === confirmInput.value) {
      confirmInput.setCustomValidity("");
    } else {
      confirmInput.setCustomValidity("Passwords do not match");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formElem = e.target;

    formElem.reportValidity();

    if (!formElem.checkValidity()) {
      return;
    }

    const formData = new FormData(formElem);
    try {
      const username = formData.get("username");
      const password = formData.get("password");
      console.log(JSON.stringify({ username: username, password: password }));
      const response = await fetch("/api/account/signup", {
        method: "post",
        body: JSON.stringify({ username: username, password: password }),
        headers: {
          "Content-type": "application/json",
        },
      });

      const { accessToken } = await response.json();
      sessionStorage.setItem("accessToken", accessToken);

      window.location.replace("/");
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message || "Error logging in. Please try again.");
    }
  }

  return (
    <Card className="w-[420px] self-center justify-self-center">
      <CardHeader>
        <CardTitle className=" text-4xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your username below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="signupForm" method="post" onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" minlength="3" placeholder="e.g. John Doe" required />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                minlength="7"
                placeholder="********"
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="conf-password">Confirm Password</Label>
              <Input
                type="password"
                id="conf-password"
                name="conf-password"
                minlength="7"
                placeholder="********"
                required
                onChange={handleConfirmPasswordChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-6">
        <Button className=" w-full" form="signupForm">
          Sign Up
        </Button>

        <p className=" text-muted-foreground mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
