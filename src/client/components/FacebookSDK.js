"use client";

import { useEffect } from "react";

export default function FacebookSDK() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.fbAsyncInit = function () {
        FB.init({
          appId: process.env.FACEBOOK_CLIENT_ID, 
          cookie: true,
          xfbml: true,
          version: "v14.0",
        });
        FB.AppEvents.logPageView(); 
      };

      (function (d, s, id) {
        if (d.getElementById(id)) return;
        const js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        d.getElementsByTagName(s)[0].parentNode.insertBefore(
          js,
          d.getElementsByTagName(s)[0]
        );
      })(document, "script", "facebook-jssdk");
    }
  }, []);

  return null;
}
