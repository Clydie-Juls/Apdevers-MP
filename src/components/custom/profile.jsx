import { useEffect, useState } from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Account } from '@/lib/Account';

const Profile = () => {
    const [account, setAccount] = useState(null);

    const handleLogOutClick = async () => {
        if (account === null) {
            return;
        }

        await Account.logout();
        location.replace('/');
        location.reload();
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            const isLoggedIn = await Account.isLoggedIn();

            if (!isLoggedIn) {
                setAccount(null);
                return;
            }

            const accountDetails = await Account.getDetails();
            setAccount(accountDetails);
        };
        
        checkLoginStatus();
    }, []);
    
    return (
        <div className='flex gap-4 items-center'>
            {account ? (
                <>
                    <a href={`/user/${account._id}`} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={account.picture} />
                            <AvatarFallback className="text-xl">{account.username[0]}</AvatarFallback>
                        </Avatar>

                        <p className="font-bold">{account.username}</p>
                    </a>            

                    <Button onClick={handleLogOutClick}>Log Out</Button>
                </>
            ) : (
                <>
                    <Button asChild>
                        <a href="/login">Log In</a>
                    </Button>

                    <Button asChild>
                        <a href="/signUp">Sign Up</a>
                    </Button>
                </>
            )}

        </div>
    );
};

export default Profile;