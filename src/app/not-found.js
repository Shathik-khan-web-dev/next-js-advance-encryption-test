"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

const NotFoundPage = () => {
  const router = useRouter();
  const handleHome = () => {
    router.push("/");
  };

  return (
    <div>
      <section className="page_404 ">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 d-flex flex-col justify-center items-center ">
              <div className="col-sm-10 col-sm-offset-1  text-center">
                <div className="four_zero_four_bg mt-16">
                  <h1 className="text-center dark:text-black ">404</h1>
                </div>

                <div className="content_box_404">
                  <h3 className="h2 dark:text-black">Look like you&apos;re lost</h3>

                  <p className="dark:text-black">the page you are looking for not available!</p>

                  <span
                    className="link_404 text-decoration-underline rounded-3"
                    onClick={handleHome}>
                    Go to Home
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
