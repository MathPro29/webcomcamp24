// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "/src/components/navbar.jsx";
import Snowfall from 'react-snowfall'

export default function MainLayout() {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Snowfall />
        </>
    );
}
