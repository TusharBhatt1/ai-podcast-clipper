"use client";
import { Link } from "lucide-react";
import Lottie from "lottie-react";
import React from "react";
import lottiejson from "../../public/lottie.json";
export default function CreatedBy() {
  return (
    <div className="flex items-center">
      {" "}
      <a href="https://tusharbhatt.vercel.app" target="_blank" className="hover:underline">
        <h1 className="flex gap-2 font-bold">
          {" "}
          by Tushar Bhatt <Link />
        </h1>
      </a>
      <Lottie animationData={lottiejson} style={{ height: "70px" }} />{" "}
    </div>
  );
}
