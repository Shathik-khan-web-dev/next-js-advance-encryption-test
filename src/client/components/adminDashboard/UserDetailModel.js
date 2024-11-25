"use client";
import Image from "next/image";
import React from "react";

const UserDetailModal = ({ user, orders, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="relative rounded-lg">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>
        <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10 w-full">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          <div className="flex items-center mb-4">
            <Image
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-full mr-4"
              height={100}
              width={100}
              draggable="false"
            />
            <div>
              <p>
                <strong className="text-[#e8126aff]">Name:</strong> {user.name}
              </p>
              <p>
                <strong className="text-[#e8126aff]">Email:</strong>{" "}
                {user.email}
              </p>
              <p>
                <strong className="text-[#e8126aff]">Role:</strong> {user.role}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto max-h-60">
            <h3 className="mt-4 font-semibold text-[#e8126aff]">Cart Items</h3>
            <div className="flex flex-col overflow-y-auto max-h-24">
              {user.cartItem.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center m-2 border p-2 rounded shadow-sm">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    height={100}
                    width={100}
                    draggable="false"
                    className="w-16 h-16 object-cover mr-2"
                  />
                  <div className="flex flex-col">
                    <p>{item.name}</p>
                    <p>Price: {item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-4 font-semibold text-[#e8126aff]">
              Favorite Items
            </h3>
            <div className="flex flex-col overflow-y-auto max-h-24">
              {user.favoriteItem.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center m-2 border p-2 rounded shadow-sm">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    height={100}
                    width={100}
                    draggable="false"
                    className="w-16 h-16 object-cover mr-2"
                  />
                  <div className="flex flex-col">
                    <p>{item.name}</p>
                    <p>Price: {item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-4 font-semibold text-[#e8126aff]">Orders</h3>
            <div className="flex flex-col overflow-y-auto max-h-24">
              <ul>
                {orders.map((order) => (
                  <li key={order._id} className="mb-4">
                    <h4>
                      <span className="font-semibold text-[#e8126aff]">
                        Order ID:
                      </span>{" "}
                      {order._id}
                    </h4>
                    <p className="">
                      {" "}
                      <span className="font-semibold text-[#e8126aff]">
                        Total Amount:
                      </span>{" "}
                      {order.totalAmount}
                    </p>
                    <p className="">
                      <span className="font-semibold text-[#e8126aff]">
                        Status:
                      </span>{" "}
                      {order.orderStatus}
                    </p>

                    <h5 className="mt-2 font-semibold">Products:</h5>
                    <div className="flex flex-col">
                      {order.products.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center m-2 border p-2 rounded shadow-sm">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            height={100}
                            width={100}
                            draggable="false"
                            className="w-16 h-16 object-cover mr-2"
                          />
                          <div className="flex flex-col">
                            <p>{product.name}</p>
                            <p>Price: {product.price}</p>
                            <p>Quantity: {product.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
