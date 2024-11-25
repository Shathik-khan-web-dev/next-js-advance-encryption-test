"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import config from "@/config";
import { cn } from "@/client/utils/cn";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { Input } from "@/client/components/ui/input";
import { useSession } from "next-auth/react";
import { AiOutlineClose } from "react-icons/ai";
import { FiUser, FiTruck } from "react-icons/fi";

export default function Orders() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("placed");
  const [orderData, setOrderData] = useState([]);
  const [searchOrderData, setSearchOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userDetails, setUserDetails] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [IsLoading, setIsLoading] = useState();
  const [error, setError] = useState();

  const ordersPerPage = 20;

  const tableRef = useRef(null); // Create a ref for the table

  const sections = [
    { label: "Orders Placed", value: "placed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  useEffect(() => {
    async function fetchOrders() {
      try {
        const apiResponse = await _get(`/api/admin`, {
          controllerName: "getOrders",
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        setOrderData(response.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
    if (session) {
      fetchOrders();
    }
  }, [session]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 3) {
        setDebouncedQuery(searchQuery);
      } else {
        setDebouncedQuery("");
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      const filtered = orderData.filter((order) =>
        order.orderId.toString().includes(debouncedQuery)
      );
      setSearchOrderData(filtered);
    } else {
      setSearchOrderData([]);
    }
  }, [debouncedQuery, orderData]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setCurrentPage(1); // Reset to first page on section change
  };

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedOrder(orderId);
    setNewStatus(newStatus);
  };

  const confirmStatusChange = async () => {
    if (selectedOrder && newStatus) {
      try {
        await axios.patch(
          `/api/admin?action=updateOrderStatus&orderId=${selectedOrder}`,
          { orderStatus: newStatus }
        );
        /*     await _patch(
          `/api/admin?action=updateOrderStatus&orderId=${selectedOrder}`,
          { orderStatus: newStatus }
        ); */

        setOrderData((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === selectedOrder
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );

        setSelectedOrder(null);
        setNewStatus("");
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  const getOrderCountForSection = (sectionValue) => {
    return Array.isArray(orderData)
      ? orderData.filter((order) => order.orderStatus === sectionValue).length
      : 0;
  };

  // Filtered orders based on active section or search query
  const filteredOrders = debouncedQuery
    ? searchOrderData
    : orderData.filter((order) => {
        if (activeSection === "placed") return order.orderStatus === "placed";
        return order.orderStatus === activeSection;
      });

  // Pagination logic - Slice filtered orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getDropdownOptions = (order) => {
    return sections
      .filter(
        (section) =>
          section.value !== order.orderStatus && section.value !== "placed"
      )
      .map((section) => (
        <option key={section.value} value={section.value}>
          {section.label}
        </option>
      ));
  };

  const showUserDetails = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getSingleUser",
        userId: userId,
      });
  
      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        setUserDetails(response.user);
      } else {
        setError("Failed to fetch user data");
      }
    } catch (error) {
      setError("Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  const showDeliveryDetails = (delivery) => {
    setDeliveryDetails(delivery);
  };

  const closeModal = () => {
    setUserDetails(null);
    setDeliveryDetails(null); // Close delivery details modal
  };

  return (
    <div
      className="flex flex-col flex-1 bg-gray-100 dark:bg-neutral-900 min-h-screen rounded-tl-2xl
     border border-neutral-200 dark:border-neutral-700">
      <div className="flex justify-center space-x-4 p-4 bg-white dark:bg-neutral-800 shadow-md">
        <div className="flex justify-center relative">
          <div>
            <LabelInputContainer>
              <Input
                type="text"
                placeholder="Search by Order ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border dark:border-neutral-700 p-2 rounded-xl md:w-58 dark:bg-black"
              />
            </LabelInputContainer>
          </div>
          {searchQuery && (
            <AiOutlineClose
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              size={15}
            />
          )}
        </div>
        {sections.map((section) => (
          <button
            key={section.value}
            className={`px-6 py-2  font-sm text-sm focus:outline-none transition-colors
              bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]
              ${
                activeSection === section.value
                  ? " text-[#e8126aff] shadow"
                  : "bg-gray-200 dark:bg-neutral-700 text-black dark:text-[#ffc107ff]"
              }`}
            onClick={() => handleSectionChange(section.value)}>
            {section.label} - [
            <span className=" text-[#0078d7ff]">
              {getOrderCountForSection(section.value)}
            </span>
            ] <BottomGradient />
          </button>
        ))}
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-y-auto mb-32">
        {currentOrders.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-neutral-800">
            <table
              ref={tableRef}
              className="min-w-full table-auto bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr className="bg-gray-200 dark:bg-neutral-700 text-center">
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    No
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Order ID
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Product Items
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Items No.
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Order Status
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Date
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Quantity
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Total Price
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-600 text-sm text-center">
                {currentOrders.map((order, index) => {
                  const currentDate = new Date(order.createdAt);
                  const formattedDate = `${currentDate.getDate()}/${
                    currentDate.getMonth() + 1
                  }/${String(currentDate.getFullYear()).slice(-2)}`;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                      <td className=" border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-1 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400 text-xs">
                        {order.orderId}
                      </td>
                      <td className="px-1 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        <div className="overflow-y-auto max-h-14">
                          {order.products.map((product) => (
                            <div
                              key={product.productId}
                              className="flex items-center space-x-2 mb-2">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                height={100}
                                width={100}
                                draggable="false"
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                              <span>{product.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        {order.products.length}
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.orderId, e.target.value)
                          }
                          className="w-full md:w-auto border border-gray-800 bg-white dark:bg-black 
                          dark:text-[#e8126aff] text-black rounded-md h-10 px-2 focus:outline-none 
                          focus:ring-2 focus:ring-[#ffc107ff] hover:bg-white hover:text-black">
                          <option value={order.orderStatus} disabled>
                            {order.orderStatus}
                          </option>
                          {getDropdownOptions(order)}
                        </select>
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        {order.products.reduce(
                          (total, product) => total + product.quantity,
                          0
                        )}
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-green-500">
                        ₹ {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-2 border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                        {order.paymentStatus === "Paid" ? "✔️" : "—"}
                      </td>
                      <td className="px-2 py-2 border dark:border-neutral-700">
                        <div className="flex items-center justify-evenly gap-2">
                          <button
                            className="text-[#0078d7ff] hover:text-gray-500 flex items-center"
                            onClick={() => showUserDetails(order.userId)}>
                            <FiUser aria-hidden="true" className="h-5 w-5" />
                          </button>

                          <button
                            className="flex items-center justify-center text-red-500 hover:text-gray-500"
                            onClick={() => showDeliveryDetails(order.delivery)}>
                            <FiTruck aria-hidden="true" className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination buttons inside the table */}
            <div className="flex justify-center space-x-4 p-4">
              <button
                className="px-4 py-2 rounded-full font-semibold bg-gray-200 dark:bg-neutral-700 text-black dark:text-white"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                Previous
              </button>
              <button
                className="px-4 py-2 rounded-full font-semibold bg-gray-200 dark:bg-neutral-700 text-black dark:text-white"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-neutral-300 mt-6">
            No orders found.
          </p>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 flex justify-center items-center z-10 bg-gray-900 bg-opacity-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4 ">
              Confirm status change for order ID: {selectedOrder}
            </h2>
            <p className="">New status: {newStatus}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={confirmStatusChange}>
                Confirm
              </button>
              <button
                className="bg-red-500 py-2 px-4 rounded"
                onClick={() => setSelectedOrder(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {userDetails && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}>
          <div
            className="bg-white dark:bg-neutral-800 rounded-lg p-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            <h2 className="text-lg font-semibold">User Details</h2>
            <div className="flex items-center mb-4">
              <Image
                src={userDetails.image}
                alt={userDetails.name}
                width={100}
                height={100}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <p>
                  <strong>Name:</strong> {userDetails.name}
                </p>
                <p>
                  <strong>Email:</strong> {userDetails.email}
                </p>
                <p>
                  <strong>Role:</strong> {userDetails.role}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Delivery Details</h3>
              <p>
                <strong>Phone Number:</strong>{" "}
                {userDetails.delivery.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Secondary Number:</strong>{" "}
                {userDetails.delivery.secondaryNumber || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {userDetails.delivery.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {userDetails.delivery.state || "N/A"}
              </p>
              <p>
                <strong>Street Address:</strong>{" "}
                {userDetails.delivery.streetAddress || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong> {userDetails.createdAt || "N/A"}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {deliveryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold">Delivery Details</h2>
            <div className="mt-4">
              <p>
                <strong>Full Name:</strong> {deliveryDetails.fullName}
              </p>
              <p>
                <strong>Phone:</strong> {deliveryDetails.phone || "N/A"}
              </p>
              <p>
                <strong>Secondary Phone:</strong>{" "}
                {deliveryDetails.secondaryPhone || "N/A"}
              </p>
              <p>
                <strong>Apartment Number:</strong>{" "}
                {deliveryDetails.apartmentNumber || "N/A"}
              </p>
              <p>
                <strong>Street Address:</strong> {deliveryDetails.streetAddress}
              </p>
              <p>
                <strong>City:</strong> {deliveryDetails.city}
              </p>
              <p>
                <strong>State:</strong> {deliveryDetails.state}
              </p>
              <p>
                <strong>Country:</strong> {deliveryDetails.country}
              </p>
              <p>
                <strong>Gift Wrap:</strong>{" "}
                {deliveryDetails.giftWrap ? "Yes" : "No"}
              </p>
              <p>
                <strong>Gift Message:</strong>
                <textarea
                  className="mt-2 p-2 border rounded w-full"
                  value={deliveryDetails.giftMessage}
                />
              </p>
            </div>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
