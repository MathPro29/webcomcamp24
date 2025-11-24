// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar.jsx"; 

export default function MainLayout() {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    );
}
