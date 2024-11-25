"use client";
import React, { useState, useEffect } from "react";
import config from "@/config";
import { _get, _post } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { cn } from "@/client/utils/cn";
import { useSession } from "next-auth/react";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = {
    fullName: e.target.firstname.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    secondaryPhone: e.target.secondaryPhone.value,
    apartmentNumber: e.target.apartmentNumber.value,
    city: e.target.city.value,
    state: e.target.state.value,
    country: e.target.country.value,
    streetAddress: e.target.streetAddress.value,
    giftWrap: e.target.apartmentNumberCheckbox.checked,
    giftMessage: e.target.giftMessage.value,
  };

  try {
    const apiResponse = await _post(`/api/visitor`, {
      controllerName: "addAddress",
      ...formData, // Include form data
    });

    const response = config.isProduction
      ? decryptData(apiResponse.encrypt)
      : apiResponse.encrypt;

    toast.success(response.message);
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

const Address = () => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    secondaryPhone: "",
    apartmentNumber: "",
    city: "",
    state: "",
    country: "India", // Default country
    streetAddress: "",
    giftWrap: false,
    giftMessage: "",
  });

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const apiResponse = await _get(`/api/visitor`, {
          controllerName: "getAddress",
          email: session.user.email,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const address = response.address.delivery;

        setFormData({
          fullName: address.userName || "",
          phone: address.phoneNumber || "",
          secondaryPhone: address.secondaryNumber || "",
          apartmentNumber: address.apartmentNumber || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "India",
          streetAddress: address.streetAddress || "",
          giftWrap: address.giftWrap || false,
          giftMessage: address.giftWrapMessage || "",
        });
      } catch (error) {
        throw error;
      }
    };

    if (session?.user?.email) {
      fetchAddressData();
    }
  }, [session]);

  return (
    <div className="flex flex-1 h-full">
      <div
        className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700
       bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto ">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 shadow-input bg-white dark:bg-black rounded-lg  pb-10">
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center underline underline-offset-2">
            Delivery Address
          </h2>
          <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300 text-center">
            Provide your delivery address here for shipping your order.
          </p>

          <form className="flex-grow my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="firstname">Full name</Label>
                <Input
                  id="firstname"
                  placeholder="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  readOnly
                  disabled
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="9874561230"
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="secondaryPhone">Secondary number</Label>
                <Input
                  id="secondaryPhone"
                  placeholder="9874561230"
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryPhone: e.target.value,
                    })
                  }
                />
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="apartmentNumber">Apartment Number</Label>
                <Input
                  id="apartmentNumber"
                  placeholder="12/2"
                  type="text"
                  value={formData.apartmentNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apartmentNumber: e.target.value,
                    })
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  type="text"
                  value={formData.country}
                  readOnly
                  disabled
                />
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  placeholder="Street Address"
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      streetAddress: e.target.value,
                    })
                  }
                />
              </LabelInputContainer>
              <div className="pt-4 flex items-center">
                <input
                  id="apartmentNumberCheckbox"
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={formData.giftWrap}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      giftWrap: e.target.checked,
                    })
                  }
                />
                <Label
                  htmlFor="apartmentNumberCheckbox"
                  className="text-neutral-600 dark:text-neutral-300">
                  Gift Wrapping
                </Label>
              </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="giftMessage">Gift wrap message</Label>
                <Input
                  id="giftMessage"
                  placeholder="many more happy returns of the day"
                  type="text"
                  value={formData.giftMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      giftMessage: e.target.value,
                    })
                  }
                />
              </LabelInputContainer>
            </div>

            <button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit">
              Save Address &rarr;
              <BottomGradient />
            </button>
          </form>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default Address;

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
