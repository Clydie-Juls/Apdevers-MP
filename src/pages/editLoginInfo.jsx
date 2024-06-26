import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { fetchWithTokenRefresh } from "../lib/authFetch";
import AnimBackground from "@/components/custom/animBackground";
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
import { Account } from "@/lib/Account";

const EditLoginInfo = () => {
  const { id } = useParams();

  const [newUserInfo, setNewUserInfo] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!id) {
      location.replace("/");
      return;
    }

    const fetchData = async () => {
      const { response, data } = await fetchWithTokenRefresh(() =>
        fetch(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        })
      );

      console.log("EFFEFEFE", data);
      if (response.status === 404) {
        setNewUserInfo(null);
        return;
      }

      const userInfo = data;
      setNewUserInfo((ui) => ({ ...ui, username: userInfo.user.username }));
    };

    const checkedIfLoggedIn = async () => {
      const isloggedIn = await Account.isLoggedIn();
      if (!isloggedIn) {
        window.location.replace("/login");
      }
      fetchData();
    };

    checkedIfLoggedIn();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    await fetchWithTokenRefresh(() =>
      fetch(`/api/users/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(newUserInfo),
      })
    );

    location.replace(`/user/${id}`);
  }

  function handleUsernameChange(e) {
    setNewUserInfo((ui) => ({
      ...ui,
      username: e.target.value,
    }));
  }

  function handlePasswordChange(e) {
    setNewUserInfo((ui) => ({
      ...ui,
      password: e.target.value,
    }));
  }

  return (
    <div>
      <AnimBackground className="flex items-center justify-center">
        <Card className="w-[420px] self-center justify-self-center">
          <CardHeader>
            <CardTitle className="text-4xl">Edit Login Info</CardTitle>
            <CardDescription>
              Replace the information below to edit your login info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4 mb-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="username">New Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={newUserInfo.username}
                    onInput={handleUsernameChange}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className="flex flex-col gap-2">
                    New Password
                    <span className="text-gray-500">
                      (Leave blank to retain old password)
                    </span>
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={newUserInfo.password}
                    onInput={handlePasswordChange}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-6">
            <Button
              className="w-full"
              onClick={() => window.location.replace(`/user/${id}`)}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </AnimBackground>
    </div>
  );
};

export default EditLoginInfo;
