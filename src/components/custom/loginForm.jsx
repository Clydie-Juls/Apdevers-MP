import { useState } from 'react';
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
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value
      };
      console.log('Form Data:', updatedData); 
      return updatedData; 
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, password } = formData; 
      if (!username || !password) {
        throw new Error('Please provide both username and password.');
      }
  
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response:', response); 
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Login failed');
      }
      
      window.location.replace('/');
      
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.message || 'Error logging in. Please try again.');
    }
  };  
  
  return (
    <Card className="w-[420px] self-center justify-self-center">
      <CardHeader>
        <CardTitle className="text-4xl">Log in</CardTitle>
        <CardDescription>
          Enter your username below to log in your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder="e.g. John Doe" 
                required 
                value={formData.username} 
                onChange={handleChange} 
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="********" 
                required 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="keep-logged-in" />
              <label
                htmlFor="keep-logged-in"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep me logged in
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full">Log in</Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-6">
        <p className="text-muted-foreground mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-green-600">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
  }  