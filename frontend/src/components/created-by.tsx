"use client";
import { Link } from "lucide-react";
import Lottie from "lottie-react";
import React from "react";
import lottiejson from "../../public/lottie.json";
import Image from "next/image";
export default function CreatedBy() {
  return (
    <div className="flex items-center">
      {" "}
      <a
        href="https://tusharbhatt.vercel.app"
        target="_blank"
        className="hover:underline"
      >
        <div className="flex items-center gap-2 font-bold">
          {" "}
          <Image
            src={"/logo-with-name.svg"}
            alt="PodClip"
            className="hidden sm:block"
            height={120}
            width={120}
          />{" "}
          <div className="flex justify-center items-center gap-2">
          by Tushar Bhatt <Link size={14} />
          </div>
        </div>
      </a>
      <Lottie className="hidden sm:block" animationData={lottiejson} style={{ height: "70px" }} />{" "}
    </div>
  );
}
