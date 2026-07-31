"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import React, { useState } from "react";
import { RootState } from "@/lib/store";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { applyCoupon, clearCart } from "@/lib/features/carts/cartsSlice";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponSuccess, setCouponSuccess] = useState<boolean | null>(null);

  // Checkout State
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CreditCard");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{ orderNo: string; total: number } | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.validateCoupon(promoCode, totalPrice);
      setCouponSuccess(res.isValid);
      setCouponMessage(res.message);
      if (res.isValid) {
        setAppliedCode(promoCode);
        dispatch(applyCoupon(res.discountAmount));
      } else {
        setAppliedCode("");
        dispatch(applyCoupon(0));
      }
    } catch (e) {
      console.error("Failed to apply promo:", e);
      setCouponSuccess(false);
      setCouponMessage("Failed to validate promo code.");
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!customerName.trim() || !shippingAddress.trim() || !phoneNumber.trim()) {
      setCheckoutError("Please fill out all shipping fields.");
      return;
    }
    setCheckoutError("");
    setCheckoutSubmitting(true);

    try {
      const itemsPayload = (cart?.items || []).map((item) => {
        // Simple extraction of color and size keywords from attributes list
        const sizeKeywords = ["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"];
        const colorKeywords = ["Green", "Red", "Yellow", "Orange", "Blue", "Purple", "Pink", "White", "Black"];
        
        const selectedSize = item.attributes.find(a => sizeKeywords.includes(a));
        const selectedColor = item.attributes.find(a => colorKeywords.includes(a));

        return {
          productId: item.id.toString(),
          quantity: item.quantity,
          selectedColor,
          selectedSize
        };
      });

      const res = await api.submitCheckout({
        customerName,
        shippingAddress,
        phoneNumber,
        items: itemsPayload,
        promoCode: appliedCode || undefined,
        paymentMethod
      });

      setCheckoutResult({
        orderNo: res.orderNo,
        total: res.total
      });
      dispatch(clearCart());
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to complete checkout.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  if (checkoutResult) {
    return (
      <main className="py-20">
        <div className="max-w-md mx-auto px-6 text-center border border-black/10 rounded-[20px] py-10 bg-neutral-50 shadow-sm">
          <h2 className={cn([integralCF.className, "font-bold text-3xl text-black mb-4"])}>
            Thank You!
          </h2>
          <p className="text-black/60 mb-6">
            Your guest order has been placed successfully.
          </p>
          <div className="bg-white p-4 rounded-xl border border-black/5 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Order Number:</span>
              <span className="font-semibold text-black">{checkoutResult.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Grand Total:</span>
              <span className="font-bold text-black">${checkoutResult.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Status:</span>
              <span className="text-green-600 font-medium">Processing (Synced to POS)</span>
            </div>
          </div>
          <Button asChild className="rounded-full w-full py-4 h-12 bg-black text-white hover:bg-neutral-800">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {cart && cart.items.length > 0 ? (
          <>
            <BreadcrumbCart />
            <h2
              className={cn([
                integralCF.className,
                "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
              ])}
            >
              your cart
            </h2>
            <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
              <div className="w-full p-3.5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                {cart?.items.map((product, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ProductCard data={product} />
                    {arr.length - 1 !== idx && (
                      <hr className="border-t-black/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="w-full lg:max-w-[505px] p-5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                <h6 className="text-xl md:text-2xl font-bold text-black">
                  Order Summary
                </h6>
                <div className="flex flex-col space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">Subtotal</span>
                    <span className="md:text-xl font-bold">${totalPrice}</span>
                  </div>
                  {totalPrice > adjustedTotalPrice && (
                    <div className="flex items-center justify-between">
                      <span className="md:text-xl text-black/60">
                        Discount (-
                        {Math.round(
                          ((totalPrice - adjustedTotalPrice) / totalPrice) * 100
                        )}
                        %)
                      </span>
                      <span className="md:text-xl font-bold text-red-600">
                        -${Math.round(totalPrice - adjustedTotalPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">
                      Delivery Fee
                    </span>
                    <span className="md:text-xl font-bold">Free</span>
                  </div>
                  <hr className="border-t-black/10" />
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black">Total</span>
                    <span className="text-xl md:text-2xl font-bold">
                      ${Math.round(adjustedTotalPrice)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-3">
                    <InputGroup className="bg-[#F0F0F0]">
                      <InputGroup.Text>
                        <MdOutlineLocalOffer className="text-black/40 text-2xl" />
                      </InputGroup.Text>
                      <InputGroup.Input
                        type="text"
                        name="code"
                        placeholder="Add promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-transparent placeholder:text-black/40 text-black"
                      />
                    </InputGroup>
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-black text-white hover:bg-neutral-800 rounded-full w-full max-w-[119px] h-[48px]"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponMessage && (
                    <p className={cn([
                      "text-xs font-semibold px-2",
                      couponSuccess ? "text-green-600" : "text-red-600"
                    ])}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {showCheckoutForm && (
                  <div className="border border-black/10 rounded-xl p-4 space-y-3.5 bg-neutral-50/50">
                    <h5 className="font-bold text-sm text-black uppercase tracking-wider">Shipping Details (Guest)</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-black/10 rounded-lg p-2.5 text-sm bg-white text-black"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Shipping Address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full border border-black/10 rounded-lg p-2.5 text-sm bg-white text-black"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full border border-black/10 rounded-lg p-2.5 text-sm bg-white text-black"
                      />
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-medium text-black/50">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full border border-black/10 rounded-lg p-2.5 text-sm bg-white text-black"
                        >
                          <option value="CreditCard">Credit Card</option>
                          <option value="CashOnDelivery">Cash on Delivery</option>
                          <option value="BankTransfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                    {checkoutError && (
                      <p className="text-xs text-red-600 font-semibold">{checkoutError}</p>
                    )}
                  </div>
                )}

                <Button
                  type="button"
                  disabled={checkoutSubmitting}
                  onClick={() => {
                    if (!showCheckoutForm) {
                      setShowCheckoutForm(true);
                    } else {
                      handleCheckoutSubmit();
                    }
                  }}
                  className="text-sm md:text-base font-medium bg-black text-white hover:bg-neutral-800 rounded-full w-full py-4 h-[54px] md:h-[60px] group disabled:opacity-50"
                >
                  {!showCheckoutForm ? (
                    <>
                      Proceed to Checkout{" "}
                      <FaArrowRight className="text-xl ml-2 group-hover:translate-x-1 transition-all" />
                    </>
                  ) : checkoutSubmitting ? (
                    "Placing Order..."
                  ) : (
                    "Place Guest Order"
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center flex-col text-gray-300 mt-32">
            <TbBasketExclamation strokeWidth={1} className="text-6xl" />
            <span className="block mb-4">Your shopping cart is empty.</span>
            <Button className="rounded-full w-24" asChild>
              <Link href="/shop">Shop</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
