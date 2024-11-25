"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import config from "@/config";
import UserDetailModal from "./UserDetailModel";
import { cn } from "@/client/utils/cn";
import { _get, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { Input } from "@/client/components/ui/input";
import { TrashIcon } from "@heroicons/react/20/solid";
import { FiUser } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedRole, setSelectedRole] = useState("");
  const [pageRange, setPageRange] = useState("0-25");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchUsers = async () => {
    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getUsers",
        search: debouncedSearchTerm,
        role: selectedRole,
        pageRange: pageRange,
        page: page,
      });
      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      const usersData = response.users;

      // Fetch order count for each user
      const usersWithOrderCount = await Promise.all(
        usersData.map(async (user) => {
          const apiResponse = await _get(`/api/products`, {
            controllerName: "getOrdersByUserId",
            userId: user._id,
          });

          const orderResponse = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          return { ...user, orderCount: orderResponse.orders.length };
        })
      );

      setUsers(usersWithOrderCount);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm, selectedRole, pageRange, page]);

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowPopup(true);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      const apiResponse = await _delete(`/api/admin`, {
        controllerName: "deleteUser",
        userId: userId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setShowPopup(false);
      setUserToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setUserToDelete(null);
  };

  const handleView = async (user) => {
    setSelectedUser(user);
    await handleFetchOrders(user._id);
    setShowModal(true);
  };

  const handleFetchOrders = async (userId) => {
    try {
      const apiResponse = await _get(`/api/products`, {
        controllerName: "getOrdersByUserId",
        userId: userId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      setOrders(response.orders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="p-2 md:p-5 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col md:flex-row justify-evenly gap-4 md:gap-11 mb-2">
          <div>
            <LabelInputContainer>
              <Input
                type="text"
                placeholder="Search by user name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border dark:border-neutral-700 p-2 rounded-xl w-full md:w-72 dark:bg-black"
              />
            </LabelInputContainer>
          </div>

          <h2 className="text-2xl  text-[#ffc107ff] underline underline-offset-2 ">
            All Users
          </h2>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-auto border border-gray-800 bg-white dark:bg-black 
            dark:text-[#e8126aff] text-black rounded-md h-10 px-2 focus:outline-none 
            focus:ring-2 focus:ring-[#ffc107ff] hover:bg-white hover:text-black">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="visitor">Visitor</option>
          </select>

          <select
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            className="w-full md:w-auto border border-gray-800 bg-white dark:bg-black 
            dark:text-[#e8126aff] text-black rounded-md h-10 px-2 focus:outline-none 
            focus:ring-2 focus:ring-[#ffc107ff] hover:bg-white hover:text-black">
            <option value="0-25">0-25</option>
            <option value="26-50">26-50</option>
            <option value="51-100">51-100</option>
            <option value="all">All Users</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-neutral-800">
            <table className="min-w-full table-auto bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr className="bg-gray-200 dark:bg-neutral-700 text-center">
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    No
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Image
                  </th>
                  <th className="px-4 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Name
                  </th>
                  <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Email
                  </th>
                  <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Role
                  </th>
                  <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Cart
                  </th>
                  <th className="py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Favorites
                  </th>
                  <th className="py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Coupons
                  </th>
                  <th className="py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff] ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-600 text-sm text-center">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <td className=" py-2 border dark:border-neutral-700  text-[#e8126aff]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 flex justify-center items-center  text-gray-500 dark:text-gray-400">
                      <Image
                        src={user.image}
                        alt={user.name}
                        height={50}
                        width={50}
                        className="rounded-full"
                        draggable="false"
                      />
                    </td>
                    <td className="py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.name}
                    </td>
                    <td className="px-3 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.role}
                    </td>
                    <td
                      className="px-5
                     py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.cartItem.length}
                    </td>
                    <td className="py-2 border dark:border-neutral-700  text-gray-500 dark:text-gray-400">
                      {user.favoriteItem.length}
                    </td>
                    <td className="py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.usedCoupons.length}
                    </td>
                    <td className="py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                      {user.orderCount}
                    </td>
                    <td className="border dark:border-neutral-700">
                      <div className="flex items-center justify-evenly">
                        <button
                          className="text-[#0078d7ff] hover:text-gray-500  flex items-center"
                          onClick={() => handleView(user)}>
                          <FiUser aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <button
                          className="-m-2.5 flex items-center justify-center text-red-500 hover:text-gray-500"
                          onClick={() => handleDeleteClick(user._id)}>
                          <span className="sr-only">Remove</span>
                          <TrashIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* UserDetail Modal */}
        {showModal && (
          <UserDetailModal
            user={selectedUser}
            orders={orders}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Confirmation Popup */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative rounded-lg">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>
              <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10">
                <p>Are you sure you want to delete this user?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => handleConfirmDelete(userToDelete)}>
                    Yes
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={handleCancel}>
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
