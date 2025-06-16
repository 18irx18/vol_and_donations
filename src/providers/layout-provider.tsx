'use client'

import { getCurrentUserFromDB } from '@/actions/users';
import { UserButton } from '@clerk/nextjs'
import { Dropdown, Button, message, Spin } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = React.useState<any | null | undefined>(undefined);
    const [dropdownToShow, setDropdownToShow] = React.useState<any[]>([]);
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
    const isPrivateRoute = !isAuthPage;
    const isAdminRoute = pathname.includes("/admin");
    const showHeaderAndContentWrapper = !isAuthPage;

    const userDropdown = [
        { name: "Donations", url: "/profile/donations" },
        { name: "Activities", url: "/profile/activities" },
        { name: "Dashboard", url: "/profile/dashboard" },
    ];
    const adminDropdown = [
        { name: "Campaings", url: "/admin/campaigns" },
        { name: "Donations", url: "/admin/donations" },
        { name: "Activities", url: "/admin/activities" },
        { name: "Participations", url: "/admin/participations" },
        { name: "Users", url: "/admin/users" },
        { name: "Dashboard", url: "/admin/dashboard" },

    ];

    const getHeader = () => {
        if (!showHeaderAndContentWrapper) return null;
        return (
            <div className='p-3 bg-primary flex justify-between items-center'>
                <h1 className="font-semibold text-4xl text-c4 cursor-pointer my-auto"
                    onClick={() => router.push("/")}>
                    Volunteers & Donations
                </h1>
                <div className='bg-white rounded py-3 px-3 flex items-center gap-5'>
                    <Dropdown
                        menu={{
                            items: dropdownToShow.map((menu) => ({
                                key: menu.name,
                                label: (
                                    <span className="text-base text-d1 hover:text-primary transition-all">
                                        {menu.name}
                                    </span>
                                ),
                                onClick: () => {
                                    router.push(menu.url);
                                },
                            })),
                        }}
                    >
                        <Button type="link" className="text-xl font-semibold !text-d1 hover:!text-primary">
                            {currentUser?.userName ?? "Loading..."}
                        </Button>
                    </Dropdown>
                    <UserButton />
                </div>
            </div>
        );
    };

    const getCurrentUser = async () => {
        try {
            const response = await getCurrentUserFromDB();
            if (response.error) throw new Error(response.error);
            setCurrentUser(response.data);

            if (response.data?.isAdmin) {
                setDropdownToShow(adminDropdown);
            } else {
                setDropdownToShow(userDropdown);
            }
        } catch (error: any) {
            console.error("Failed to fetch current user:", error.message);
            message.error(error.message);
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        if (showHeaderAndContentWrapper) {
            getCurrentUser();
        }
    }, [showHeaderAndContentWrapper]);

    useEffect(() => {
        if (isPrivateRoute && currentUser === null) {
            router.push("/sign-in");
        }
    }, [isPrivateRoute, currentUser]);

    if (isPrivateRoute && currentUser === undefined) {
        return <div className="flex justify-center items-center mt-20"><Spin /></div>;
    }


    if (isPrivateRoute && currentUser && isAdminRoute && !currentUser.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 gap-4">
                <span className="text-center text-xl text-red-600">
                    You are not authorized to access this page. Please contact the administrator.
                </span>
                <Button
                    danger
                    onClick={() => router.push("/")}
                >
                    Back to homepage
                </Button>
            </div>
        );
    }

    return (
        <>
            {getHeader()}
            {showHeaderAndContentWrapper ? (
                <div className="p-3">{children}</div>
            ) : (
                children
            )}
        </>
    );
}

export default LayoutProvider;
