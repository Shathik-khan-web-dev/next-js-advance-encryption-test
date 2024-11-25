"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Example() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const role = session.user?.role;
      switch (role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "employee":
          router.push("/dashboard/employee");
          break;
        case "visitor":
          router.push("/dashboard/visitor");
          break;
        default:
          router.push("/auth");
          return null;
      }
    }
  }, [session, router]); // Add 'router' to the dependency array

  return (
    <>
      <div className="flex min-h-full flex-1 pt-36 pb-16 ">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex flex-col items-center justify-center">
              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <Image
                    alt=""
                    src="https://99customizedjewellery.com/wp-content/uploads/2022/01/jewel_logo.png"
                    className="h-8 w-auto"
                    width={100}
                    height={100}
                    draggable="false"
                  />
                </Link>
              </div>
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-center text-gray-900">
                Sign-in <span className="text-[#ffc107ff]">|</span> Sign-up
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 flex gap-1 ">
                New user?{" "}
                <span className="font-semibold text-[#ffc107ff] hover:text-[#e8126a]">
                  Click Google or Facebook
                </span>
              </p>
            </div>

            <div className="mt-10">
              <div className="mt-10">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white dark:bg-black dark:text-gray-500 px-6  font-bold leading-9 tracking-tight">
                      START <span className="text-[#ffc107ff]">-</span> SHOPPING
                    </span>
                  </div>
                </div>

                <div className="transition-opacity duration-500 ease-in-out opacity-100">
                  <div className="mt-2">
                    <span
                      onClick={() => signIn("google")}
                      className="flex items-center justify-center px-6 py-3 mt-4 
             transition-colors duration-300 transform border rounded-lg
             dark:border-gray-700 cursor-pointer 
             hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 
              hover:text-white">
                      <svg className="w-6 h-6 mx-2" viewBox="0 0 40 40">
                        <path
                          d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                          fill="#FFC107"
                        />
                        <path
                          d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                          fill="#FF3D00"
                        />
                        <path
                          d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                          fill="#4CAF50"
                        />
                        <path
                          d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                          fill="#1976D2"
                        />
                      </svg>

                      <span className="mx-2">Continue with Google</span>
                    </span>

                    {/*  <span
                  onClick={() => signIn("github")}
                  className="flex items-center justify-center px-6 py-3 mt-4
                    transition-colors duration-300 transform border 
                   rounded-lg dark:border-gray-700 cursor-pointer ">
                  <svg
                    className="w-7 h-7 mx-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.868 8.165 6.839 9.489.5.091.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.153-1.11-1.461-1.11-1.461-.907-.62.069-.607.069-.607 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.831.092-.647.349-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.944 0-1.091.39-1.982 1.029-2.68-.103-.254-.446-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.505.338 1.91-1.294 2.75-1.025 2.75-1.025.544 1.376.202 2.392.099 2.646.64.698 1.029 1.589 1.029 2.68 0 3.841-2.339 4.688-4.565 4.937.359.309.678.919.678 1.854 0 1.338-.012 2.418-.012 2.747 0 .267.18.576.688.479C19.134 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>

                  <span className="mx-2">Continue with GitHub</span>
                </span> */}

                    <span
                      onClick={() => signIn("facebook")}
                      className="flex items-center justify-center px-6 py-3 mt-4 
                      transition-colors duration-300 transform border rounded-lg
                      dark:border-gray-700 cursor-pointer 
                      hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 
                       hover:text-white">
                      <svg
                        className="w-7 h-7 mx-2"
                        viewBox="0 0 24 24"
                        fill="#1877F2"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M22.675 0h-21.35C.597 0 0 .592 0 1.326v21.348C0 23.408.597 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.412c0-3.1 1.893-4.788 4.656-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.919.001c-1.504 0-1.795.714-1.795 1.763v2.312h3.588l-.467 3.622h-3.121V24h6.116c.729 0 1.326-.592 1.326-1.326V1.326C24 .592 23.408 0 22.675 0z"
                        />
                      </svg>

                      <span className="mx-2">Continue with Facebook</span>
                    </span>

                    {/*  <span
                  onClick={() => signIn("instagram")}
                  className="flex items-center justify-center px-6 py-3 mt-4
    transition-colors duration-300 transform border 
    rounded-lg dark:border-gray-700 cursor-pointer ">
                  <svg
                    className="w-7 h-7 mx-2"
                    viewBox="0 0 24 24"
                    fill="#E4405F"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.063 2.633.348 3.608 1.323.975.975 1.26 2.242 1.323 3.608.058 1.267.07 1.647.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.348 2.633-1.323 3.608-.975.975-2.242 1.26-3.608 1.323-1.267.058-1.647.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.348-3.608-1.323-.975-.975-1.26-2.242-1.323-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.063-1.366.348-2.633 1.323-3.608.975-.975 2.242-1.26 3.608-1.323C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.735 0 8.332.014 7.052.072 5.77.13 4.676.323 3.752.747c-.924.424-1.71 1.01-2.596 1.897C.323 4.676.13 5.77.072 7.052.014 8.332 0 8.735 0 12c0 3.265.014 3.668.072 4.948.058 1.28.251 2.374.675 3.298.424.924 1.01 1.71 1.897 2.596.886.886 1.672 1.472 2.596 1.897.924.424 2.018.617 3.298.675 1.28.058 1.683.072 4.948.072s3.668-.014 4.948-.072c1.28-.058 2.374-.251 3.298-.675.924-.424 1.71-1.01 2.596-1.897.886-.886 1.472-1.672 1.897-2.596.424-.924.617-2.018.675-3.298.058-1.28.072-1.683.072-4.948s-.014-3.668-.072-4.948c-.058-1.28-.251-2.374-.675-3.298-.424-.924-1.01-1.71-1.897-2.596-.886-.886-1.672-1.472-2.596-1.897-.924-.424-2.018-.617-3.298-.675C15.668.014 15.265 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"
                    />
                  </svg>

                  <span className="mx-2">Continue with Instagram</span>
                </span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <div className="relative w-auto h-96">
            <Image
              alt="Background Image"
              src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
              className="absolute inset-0 h-full w-full object-cover"
              height={1056}
              width={1024}
            />
          </div>
        </div>
      </div>
    </>
  );
}
