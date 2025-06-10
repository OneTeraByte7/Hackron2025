import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64  w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
