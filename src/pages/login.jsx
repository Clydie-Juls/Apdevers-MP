import AnimBackground from "@/components/custom/animBackground";
import { LoginForm } from "@/components/custom/loginForm";

const Login = () => {
  return (
    <div>
      <AnimBackground className="flex items-center justify-center">
        <LoginForm />
      </AnimBackground>
    </div>
  );
};

export default Login;
