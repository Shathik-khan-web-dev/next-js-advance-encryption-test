import dynamic from "next/dynamic";

// Dynamically import the component with no SSR 
const Location = dynamic(
  () => import("@/client/components/Location"),
  {
    ssr: false,
  }
);

export default Location;
