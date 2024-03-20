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
    const passwordInput = document.querySelector('#password');
    const confirmInput = e.target;

    if (passwordInput.value === confirmInput.value) {
      confirmInput.setCustomValidity('');
    } else {
      confirmInput.setCustomValidity('Passwords do not match');
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
        <form id="signupForm" method="post" action="/api/account/signup">
          <div className="grid w-full items-center gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="e.g. John Doe" required />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Password</Label>
              <Input type="password" id="password" name="password" placeholder="********" required />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="conf-password">Confirm Password</Label>
              <Input
                type="password"
                id="conf-password"
                name="conf-password"
                placeholder="********"
                required
                onChange={handleConfirmPasswordChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-6">
        <Button className=" w-full" form="signupForm">Sign Up</Button>


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
