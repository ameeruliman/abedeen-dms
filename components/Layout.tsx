import Sidebar from "./Sidebar";
import Header from "./Header";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Sidebar />
      <Header />
      <main>{children}</main>
    </>
  );
}