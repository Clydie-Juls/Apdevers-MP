import Logo from './logo';
import Profile from './profile';
import SearchBar from './searchBar';

const Header = () => {
    return (
        <header className="px-14 py-6 grid grid-cols-[auto_1fr_auto] gap-12 items-center bg-zinc-900 rounded-b-lg border-b-2 border-border z-10">
            <h1><a href="/"><Logo /></a></h1>
            <SearchBar />
            <Profile />
        </header>
    );
};

export default Header;