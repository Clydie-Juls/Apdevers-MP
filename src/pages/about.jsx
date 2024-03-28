import AnimBackground from "@/components/custom/animBackground";
import Header from "@/components/custom/header";

const About = () => {
    return (
        <AnimBackground>
            <div className="w-full h-full bg-background">
                <Header />

                <main className="mx-16 my-5 px-7 py-5 mt-7 border-2 border-border rounded-xl bg-zinc-950">
                    <h2 className="mb-2 text-3xl font-bold">About</h2>

                    <p>
                        This is a forum to discuss all things tech! From the newest 
                        gaming laptop to the latest AI model, feel free to share your 
                        thoughts here. Created by S14-Group 9 for CCAPDEV.
                    </p>

                    <br />

                    <h2 className="mb-2 text-2xl font-bold">Dependencies</h2>

                    <ul className="pl-8 grid grid-cols-3 list-disc">
                        <li>@radix-ui/react-avatar@1.0.4</li>
                        <li>@radix-ui/react-checkbox@1.0.4</li>
                        <li>@radix-ui/react-dropdown-menu@2.0.6</li>
                        <li>@radix-ui/react-label@2.0.2</li>
                        <li>@radix-ui/react-popover@1.0.7</li>
                        <li>@radix-ui/react-separator@1.0.3</li>
                        <li>@radix-ui/react-slot@1.0.2</li>
                        <li>@radix-ui/react-tabs@1.0.4</li>
                        <li>@radix-ui/react-tooltip@1.0.7</li>
                        <li>@types/node@20.11.15</li>
                        <li>@types/react-dom@18.2.18</li>
                        <li>@types/react@18.2.51</li>
                        <li>@vitejs/plugin-react@4.2.1</li>
                        <li>autoprefixer@10.4.17</li>
                        <li>bcrypt@5.1.1</li>
                        <li>class-variance-authority@0.7.0</li>
                        <li>clsx@2.1.0</li>
                        <li>concurrently@8.2.2</li>
                        <li>eslint-plugin-react-hooks@4.6.0</li>
                        <li>eslint-plugin-react-refresh@0.4.5</li>
                        <li>eslint-plugin-react@7.33.2</li>
                        <li>eslint@8.56.0</li>
                        <li>express@4.18.2</li>
                        <li>lucide-react@0.320.0</li>
                        <li>mongoose@8.2.1</li>
                        <li>multer@1.4.5-lts.1</li>
                        <li>node-fetch@3.3.2</li>
                        <li>nodemon@3.0.3</li>
                        <li>postcss@8.4.33</li>
                        <li>react-dom@18.2.0</li>
                        <li>react-router-dom@6.22.0</li>
                        <li>react-router@6.22.0</li>
                        <li>react@18.2.0</li>
                        <li>shadcn-ui@0.8.0</li>
                        <li>tailwind-merge@2.2.1</li>
                        <li>tailwindcss-animate@1.0.7</li>
                        <li>tailwindcss@3.4.1</li>
                        <li>vite@5.0.12</li>
                    </ul>
                </main>
            </div>
        </AnimBackground>
    );
};

export default About;