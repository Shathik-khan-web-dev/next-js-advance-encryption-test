"use client";

import { useState, useEffect } from "react";
import { FollowerPointerCard } from "@/client/components/ui/following-pointer";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
 
const SliderComponent = dynamic(
  () => import("@/client/components/codeSplit/2_home/slider"),
  { ssr: false }
);
const TrendingComponent = dynamic(
  () => import("@/client/components/codeSplit/2_home/trending"),
  { ssr: false }
);
const GiftsComponent = dynamic(
  () => import("@/client/components/codeSplit/2_home/gifts"),
  { ssr: false }
);
const AllCategoriesComponent = dynamic(
  () => import("@/client/components/codeSplit/2_home/allCategories"),
  { ssr: false }
);
const ReviewComponent = dynamic(
  () => import("@/client/components/codeSplit/2_home/review"),
  { ssr: false }
);
const LazyLoadComponent = dynamic(
  () => import("@/client/components/common/LazyLoad"),
  { ssr: false }
);

export default function Home() {
  const { data: session } = useSession();

  const [components, setComponents] = useState({
    slider: <SliderComponent key="slider" />,
    trending: <TrendingComponent key="trending" />,
    gifts: null,
    categories: null,
    review: null,
  });

  const loadMoreComponents = () => {
    setComponents((prevComponents) => ({
      ...prevComponents,
      gifts: <GiftsComponent key="gifts" />,
      categories: <AllCategoriesComponent key="categories" />,
      review: <ReviewComponent key="review" />,
    }));
  };

  return (
    <div className="mx-auto py-5 md:w-5/6 md:mt-20 mt-20">
      {/*  <div className="mx-auto py-5 md:w-5/6 md:mt-20 mt-20">
        {Object.values(components).map(
          (component, index) => component && <div key={index}>{component}</div>
        )}
      </div>
      <LazyLoadComponent onLoad={loadMoreComponents} /> */}

      <div className="block md:hidden">
        <SliderComponent />
        <TrendingComponent />
        <GiftsComponent />
        <AllCategoriesComponent />
        <ReviewComponent />
      </div>

      {/* Visible on larger screens */}
      <div className="hidden md:block cursor-default ">
        <FollowerPointerCard
          title={
            <TitleComponent
              title={session?.user?.name}
              avatar={session?.user?.image}
            />
          }>
          <SliderComponent />
          <TrendingComponent />
          <GiftsComponent />
          <AllCategoriesComponent />
          <ReviewComponent />
        </FollowerPointerCard>
      </div>
    </div>
  );
}

const TitleComponent = ({ title, avatar }) => (
  <div className="flex space-x-2 items-center">
    {avatar ? (
      <Image
        src={avatar}
        height={20}
        width={20}
        alt="User avatar"
        className="rounded-full border-2 border-white"
      />
    ) : (
      <UserCircleIcon className="h-5 w-5 text-gray-900 flex-shrink-0" />
    )}
    <p>{title || "User"}</p>
  </div>
);

// className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"></div>

