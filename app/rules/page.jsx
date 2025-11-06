"use client";
import React from "react";

export default function Rules() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Platform Rules</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <p className="text-gray-700">
          To maintain a safe and fair marketplace, all users must follow these rules:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Always Secure your accts few hours after login</li>
          <li>Accounts cannot be replaced after changing the password.</li>
          <li>We replace bad accounts, if fault is from us (not after use)</li>
          <li>This rules can be changed at any time without prior notice.</li>
          <li>Obscene language to the admins may be grounds for service refusal.</li>
          <li>Ignorance of the rules does not absolve you of responsibility.</li>
          <li>The response time for technical support and the resolution of all problems/claims is 24/7.</li>
          <li>Accounts are always checked by our private program on private mobile proxy prior to sale, so we can guarantee 100% validity of the items.</li>
          <li>Accounts cannot be returned; instead, they can only be replaced if bad, provided that other rules are complied with.</li>
          <li>The store is not liable for any account activity. How your account will last depends on how it’s used. No replacement or refund for an account suspended/disabled/logged out after a successful login.</li>
          <li>Purchase an account only if you understand how to use it. Refunds will not be given if you buy something and don't know how to use it. The best we can do is to give you tips</li>
        </ul>
      </div>
    </div>
  );
}
