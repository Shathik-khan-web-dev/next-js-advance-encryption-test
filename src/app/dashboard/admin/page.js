"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/client/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconShoppingCartPlus,
  IconUserBolt,
  IconShoppingCart,
  IconEdit,
  IconHeart,
  IconMessagePlus,
  IconPackage,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ContentSection from "@/client/components/adminDashboard/ContentSection";
import { useDispatch } from "react-redux";
import { resetCart } from "@/client/store/nextSlice";
import { cn } from "@/client/utils/cn";

const SidebarDemo = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = async () => {
    dispatch(resetCart());
    await signOut({ redirect: false });
    router.push("/");
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("Dashboard");
        setOpen(false);
      },
    },
    {
      label: "Product's",
      href: "#",
      icon: (
        <IconEdit className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("Products");
        setOpen(false);
      },
    },
    {
      label: "User's",
      href: "#",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("Users");
        setOpen(false);
      },
    },
    {
      label: "Order's",
      href: "#",
      icon: (
        <IconPackage className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("Orders");
        setOpen(false);
      },
    },

    {
      label: "Review's",
      href: "#",
      icon: (
        <IconMessagePlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("Reviews");
        setOpen(false);
      },
    },
    {
      label: "Add to Cart",
      href: "#",
      icon: (
        <IconShoppingCart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("AddToCart");
        setOpen(false);
      },
    },
    {
      label: "My Favorite",
      href: "#",
      icon: (
        <IconHeart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        setSelectedSection("MyFavorite");
        setOpen(false);
      },
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => {
        logout();
        setOpen(false);
      },
    },
  ];

  return (
    <>
      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden",
          "h-[80vh] mt-32 mb-14"
        )}>
        <div ref={sidebarRef}>
          <Sidebar open={open} setOpen={setOpen} animate={false}>
            <SidebarBody
              className={cn("justify-between gap-10 ", {
                "w-[70%]": open,
                "md-[10%]": !open,
              })}>
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink
                      key={idx}
                      link={link}
                      onClick={link.onClick}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-300",
                        {
                          "bg-blue-500 text-white":
                            selectedSection === link.label, // Active link styles
                          "hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-neutral-200":
                            selectedSection !== link.label, // Non-active link hover styles
                        }
                      )}
                      selected={selectedSection === link.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <SidebarLink
                  link={{
                    label: session?.user?.name || "User",
                    href: " ",
                    icon: (
                      <>
                        {session?.user?.image ? (
                          <Image
                            src={session.user.image}
                            height={20}
                            width={20}
                            alt={`${session.user.name}'s profile picture`}
                            className="rounded-full "
                          />
                        ) : (
                          <UserCircleIcon className="h-5 w-5 text-gray-900 flex-shrink-0" />
                        )}
                      </>
                    ),
                  }}
                />
                <p className="text-white text-xs">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-black dark:text-white whitespace-pre underline underline-offset-2 decoration-[#e8126aff]">
                    {session?.user?.email}
                  </motion.span>
                </p>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>
        <ContentSection selectedSection={selectedSection} />
      </div>
    </>
  );
};

const Logo = () => (
  <Link
    href="#"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre underline underline-offset-2 decoration-[#e8126aff]">
      Admin Dashboard
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link
    href="#"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  </Link>
);

export default SidebarDemo;
